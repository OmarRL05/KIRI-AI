import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import { isSupabaseConfigured, supabase } from './supabase';
import {
  DEFAULT_LANGUAGE,
  type Analysis,
  type CollectedObject,
  type LangCode,
  type Profile,
} from './types';

const PROFILE_KEY = 'kiri.profile.v1';
const OBJECTS_KEY = 'kiri.objects.v1';
const DEVICE_ID_KEY = 'kiri.device_id.v1';
const BUCKET = 'objects';
const SIGNED_URL_TTL = 60 * 60;

interface AppState {
  ready: boolean;
  /** 'remote' when Supabase tables are reachable, else 'local'. */
  backend: 'remote' | 'local';
  userId: string | null;
  profile: Profile;
  objects: CollectedObject[];
  setLearning: (code: LangCode) => Promise<void>;
  finishOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  addObject: (input: {
    analysis: Analysis;
    imageUri: string;
    language: LangCode;
  }) => Promise<CollectedObject>;
  setLearned: (id: string, learned: boolean) => Promise<void>;
  removeObject: (id: string) => Promise<void>;
  hasWord: (word: string, language: LangCode) => CollectedObject | undefined;
  linkEmail: (email: string) => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

const defaultProfile: Profile = { learning: DEFAULT_LANGUAGE, onboarded: false };

interface Row {
  id: string;
  language: LangCode;
  word: string;
  translation: string;
  phonetic: string | null;
  example: string | null;
  example_translation: string | null;
  category: string | null;
  confidence: number | null;
  image_path: string;
  learned: boolean;
  created_at: string;
}

function rowToObject(row: Row, imageUri: string): CollectedObject {
  return {
    id: row.id,
    language: row.language,
    word: row.word,
    translation: row.translation,
    phonetic: row.phonetic ?? '',
    example: row.example ?? '',
    exampleTranslation: row.example_translation ?? '',
    category: row.category ?? 'Otro',
    confidence: row.confidence ?? 1,
    imagePath: row.image_path,
    imageUri,
    learned: row.learned,
    createdAt: row.created_at,
  };
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const generated = `dev-${newId()}-${newId()}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

async function persistLocalImage(uri: string): Promise<string> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) return uri;
  if (!uri.startsWith('file://')) return uri;
  try {
    const dest = `${FileSystem.documentDirectory}kiri-${newId()}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch {
    return uri;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [backend, setBackend] = useState<'remote' | 'local'>('local');
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [objects, setObjects] = useState<CollectedObject[]>([]);
  const objectsRef = useRef(objects);
  objectsRef.current = objects;

  const saveLocalObjects = useCallback(async (next: CollectedObject[]) => {
    await AsyncStorage.setItem(OBJECTS_KEY, JSON.stringify(next));
  }, []);

  const loadRemote = useCallback(async (uid: string) => {
    if (!supabase) return false;
    const { data, error } = await supabase
      .from('objects')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    const urls = rows.length
      ? await supabase.storage
          .from(BUCKET)
          .createSignedUrls(
            rows.map((r) => r.image_path),
            SIGNED_URL_TTL,
          )
      : { data: [] as { signedUrl: string | null; path: string | null }[] };
    const byPath = new Map<string, string>();
    for (const u of urls.data ?? []) if (u.path && u.signedUrl) byPath.set(u.path, u.signedUrl);
    setObjects(rows.map((r) => rowToObject(r, byPath.get(r.image_path) ?? r.image_path)));
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);
      if (storedProfile && !cancelled) {
        setProfile({ ...defaultProfile, ...JSON.parse(storedProfile) });
      }

      let remoteOk = false;
      let activeUserId: string | null = null;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          let session = sessionData.session;
          if (!session) {
            const { data } = await supabase.auth.signInAnonymously();
            session = data?.session ?? null;
          }
          activeUserId = session?.user?.id ?? (await getOrCreateDeviceId());
          if (!cancelled) {
            setUserId(activeUserId);
            remoteOk = await loadRemote(activeUserId);
          }
        } catch {
          remoteOk = false;
        }
      }

      if (!remoteOk) {
        const stored = await AsyncStorage.getItem(OBJECTS_KEY);
        if (stored && !cancelled) setObjects(JSON.parse(stored));
      }
      if (!cancelled) {
        setBackend(remoteOk ? 'remote' : 'local');
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadRemote]);

  const saveProfile = useCallback(
    async (next: Profile) => {
      setProfile(next);
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      if (backend === 'remote' && supabase && userId) {
        await supabase
          .from('profiles')
          .upsert({ id: userId, learning_language: next.learning });
      }
    },
    [backend, userId],
  );

  const setLearning = useCallback(
    (code: LangCode) => saveProfile({ ...profile, learning: code }),
    [profile, saveProfile],
  );

  const finishOnboarding = useCallback(
    () => saveProfile({ ...profile, onboarded: true }),
    [profile, saveProfile],
  );

  const resetOnboarding = useCallback(
    () => saveProfile({ ...profile, onboarded: false }),
    [profile, saveProfile],
  );

  const addObject: AppState['addObject'] = useCallback(
    async ({ analysis, imageUri, language }) => {
      const createdAt = new Date().toISOString();

      if (backend === 'remote' && supabase && userId) {
        try {
          const path = `${userId}/${newId()}.jpg`;
          const body = await (await fetch(imageUri)).arrayBuffer();
          const upload = await supabase.storage
            .from(BUCKET)
            .upload(path, body, { contentType: 'image/jpeg' });
          if (upload.error) throw upload.error;

          const { data, error } = await supabase
            .from('objects')
            .insert({
              user_id: userId,
              language,
              word: analysis.word,
              translation: analysis.translation,
              phonetic: analysis.phonetic,
              example: analysis.example,
              example_translation: analysis.exampleTranslation,
              category: analysis.category,
              confidence: analysis.confidence,
              image_path: path,
            })
            .select('*')
            .single();
          if (error) {
            await supabase.storage.from(BUCKET).remove([path]);
            throw error;
          }
          const item = rowToObject(data as Row, imageUri);
          setObjects((prev) => [item, ...prev]);
          return item;
        } catch {
          // Fall back to local storage if remote upload/insert fails
        }
      }

      const stored = await persistLocalImage(imageUri);
      const item: CollectedObject = {
        ...analysis,
        id: newId(),
        language,
        imageUri: stored,
        createdAt,
        learned: false,
      };
      const next = [item, ...objectsRef.current];
      setObjects(next);
      await saveLocalObjects(next);
      return item;
    },
    [backend, userId, saveLocalObjects],
  );

  const setLearned = useCallback(
    async (id: string, learned: boolean) => {
      const next = objectsRef.current.map((o) => (o.id === id ? { ...o, learned } : o));
      setObjects(next);
      if (backend === 'remote' && supabase) {
        await supabase.from('objects').update({ learned }).eq('id', id);
      } else {
        await saveLocalObjects(next);
      }
    },
    [backend, saveLocalObjects],
  );

  const removeObject = useCallback(
    async (id: string) => {
      const target = objectsRef.current.find((o) => o.id === id);
      const next = objectsRef.current.filter((o) => o.id !== id);
      setObjects(next);
      if (backend === 'remote' && supabase) {
        await supabase.from('objects').delete().eq('id', id);
        if (target?.imagePath) await supabase.storage.from(BUCKET).remove([target.imagePath]);
      } else {
        await saveLocalObjects(next);
      }
    },
    [backend, saveLocalObjects],
  );

  const hasWord = useCallback(
    (word: string, language: LangCode) =>
      objectsRef.current.find(
        (o) => o.language === language && o.word.toLowerCase() === word.toLowerCase(),
      ),
    [],
  );

  const linkEmail = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Supabase no está configurado');
    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
  }, []);

  const value = useMemo<AppState>(
    () => ({
      ready,
      backend,
      userId,
      profile,
      objects,
      setLearning,
      finishOnboarding,
      resetOnboarding,
      addObject,
      setLearned,
      removeObject,
      hasWord,
      linkEmail,
    }),
    [
      ready,
      backend,
      userId,
      profile,
      objects,
      setLearning,
      finishOnboarding,
      resetOnboarding,
      addObject,
      setLearned,
      removeObject,
      hasWord,
      linkEmail,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
