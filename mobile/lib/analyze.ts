import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Image as RNImage, Platform } from 'react-native';
import { isSupabaseConfigured, supabase } from './supabase';
import { getLanguage, type Analysis, type LangCode } from './types';

export const GEMINI_KEY_STORAGE = 'kiri.gemini_api_key.v1';

export type AnalyzeErrorCode =
  | 'no_object'
  | 'network'
  | 'limit'
  | 'unconfigured'
  | 'unknown';

export class AnalyzeError extends Error {
  constructor(public code: AnalyzeErrorCode, message: string) {
    super(message);
  }
}

export const AnalyzeMessages: Record<AnalyzeErrorCode, { title: string; body: string }> = {
  no_object: {
    title: 'No encontré un objeto claro',
    body: 'Acércate y deja un solo objeto en el centro.',
  },
  network: {
    title: 'Sin conexión',
    body: 'Revisa tu internet e inténtalo otra vez.',
  },
  limit: {
    title: 'Llegaste al límite de hoy',
    body: 'Vuelve mañana para seguir coleccionando.',
  },
  unconfigured: {
    title: 'Falta conectar el modelo de IA',
    body: 'Añade tu clave de Gemini en Perfil o en .env.local para analizar fotos reales.',
  },
  unknown: {
    title: 'Algo salió mal',
    body: 'Inténtalo de nuevo en unos segundos.',
  },
};

export interface AnalyzeResult {
  analysis: Analysis;
  /** Downscaled JPEG that gets stored with the object. */
  processedUri: string;
}

const MAX_EDGE = 1024;

export async function getStoredGeminiKey(): Promise<string> {
  const fromEnv = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  try {
    const saved = await AsyncStorage.getItem(GEMINI_KEY_STORAGE);
    return saved?.trim() ?? '';
  } catch {
    return '';
  }
}

export async function setStoredGeminiKey(key: string): Promise<void> {
  const trimmed = key.trim();
  if (!trimmed) {
    await AsyncStorage.removeItem(GEMINI_KEY_STORAGE);
  } else {
    await AsyncStorage.setItem(GEMINI_KEY_STORAGE, trimmed);
  }
}

async function prepareImage(uri: string, fallbackBase64?: string) {
  try {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ width: MAX_EDGE });
    const ref = await context.renderAsync();
    const result = await ref.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.72,
      base64: true,
    });
    return { uri: result.uri, base64: result.base64 ?? fallbackBase64 ?? '' };
  } catch {
    if (fallbackBase64) return { uri, base64: fallbackBase64 };
    if (Platform.OS !== 'web') {
      try {
        const b64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return { uri, base64: b64 };
      } catch {
        return { uri, base64: '' };
      }
    }
    return { uri, base64: '' };
  }
}

export const DEMO_PHOTO_ASSETS = [
  require('../assets/demo-keyboard.jpg'),
  require('../assets/demo-coffee-cup.jpg'),
  require('../assets/demo-backpack.jpg'),
] as const;

export function resolveDemoAssetUri(index: number): string {
  const mod = DEMO_PHOTO_ASSETS[index % DEMO_PHOTO_ASSETS.length];
  if (Platform.OS !== 'web') {
    const resolved = RNImage.resolveAssetSource(mod);
    if (resolved?.uri) return resolved.uri;
  }
  const asset = Asset.fromModule(mod);
  return asset.localUri || asset.uri || '';
}

const DEMO: (Analysis & { assetIndex: number })[] = [
  {
    assetIndex: 0,
    word: 'keyboard',
    translation: 'teclado',
    phonetic: '/ˈkiːbɔːd/',
    example: 'The keyboard is on the desk.',
    exampleTranslation: 'El teclado está sobre el escritorio.',
    category: 'Tecnología',
    confidence: 0.96,
  },
  {
    assetIndex: 1,
    word: 'coffee cup',
    translation: 'taza de café',
    phonetic: '/ˈkɒfi kʌp/',
    example: 'I need a coffee cup.',
    exampleTranslation: 'Necesito una taza de café.',
    category: 'Cocina',
    confidence: 0.94,
  },
  {
    assetIndex: 2,
    word: 'backpack',
    translation: 'mochila',
    phonetic: '/ˈbækpæk/',
    example: 'My backpack is heavy.',
    exampleTranslation: 'Mi mochila pesa mucho.',
    category: 'Ropa',
    confidence: 0.91,
  },
];

let demoCursor = 0;

export async function getNextDemoSpecimen(): Promise<{ analysis: Analysis; photoUri: string }> {
  const pick = DEMO[demoCursor % DEMO.length];
  demoCursor += 1;
  const mod = DEMO_PHOTO_ASSETS[pick.assetIndex];
  let photoUri = resolveDemoAssetUri(pick.assetIndex);
  try {
    const asset = Asset.fromModule(mod);
    if (!asset.downloaded) await asset.downloadAsync();
    if (asset.localUri || asset.uri) photoUri = asset.localUri ?? asset.uri;
  } catch {
    // Keep resolved URI
  }
  const { assetIndex: _ignore, ...analysis } = pick;
  return {
    analysis: { ...analysis, demo: true },
    photoUri,
  };
}

const GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-flash-latest',
] as const;

function parseGeminiJson(rawText: string): Analysis {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const parsed = JSON.parse(cleaned);
  return (Array.isArray(parsed) ? parsed[0] : parsed) as Analysis;
}

async function analyzeWithGeminiDirect(
  base64: string,
  language: LangCode,
  apiKey: string,
): Promise<Analysis> {
  const targetLang = getLanguage(language).name;
  const prompt = [
    'Identify the single most prominent physical object in the centre of this photo.',
    `Return its common everyday singular noun in ${targetLang} (lowercase unless proper noun) and its translation in Spanish.`,
    `Include a standard IPA phonetic transcription of the ${targetLang} word, one short natural example sentence in ${targetLang} (max 10 words) using the word, its Spanish translation, and a single-word Spanish category.`,
    'If no distinct object is visible, set confidence below 0.35.',
  ].join(' ');

  let lastStatus = 0;

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inlineData: { mimeType: 'image/jpeg', data: base64 } },
                  { text: prompt },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                required: [
                  'word',
                  'translation',
                  'phonetic',
                  'example',
                  'exampleTranslation',
                  'category',
                  'confidence',
                ],
                properties: {
                  word: { type: 'STRING' },
                  translation: { type: 'STRING' },
                  phonetic: { type: 'STRING' },
                  example: { type: 'STRING' },
                  exampleTranslation: { type: 'STRING' },
                  category: { type: 'STRING' },
                  confidence: { type: 'NUMBER' },
                },
              },
            },
          }),
        },
      );

      lastStatus = res.status;
      if (res.status === 503 || res.status === 429 || res.status === 404) {
        // Model overloaded or unavailable — try next model in fallback chain
        continue;
      }
      if (!res.ok) {
        continue;
      }

      const payload = await res.json();
      const parts: { text?: string; thought?: boolean }[] =
        payload?.candidates?.[0]?.content?.parts ?? [];
      const textPart = parts.find((p) => !p.thought && typeof p.text === 'string') ?? parts[0];
      const raw = textPart?.text;
      if (!raw) continue;

      const parsed = parseGeminiJson(raw);
      if (!parsed?.word || (typeof parsed.confidence === 'number' && parsed.confidence < 0.35)) {
        throw new AnalyzeError('no_object', 'No object identified');
      }
      return {
        word: String(parsed.word),
        translation: String(parsed.translation ?? ''),
        phonetic: String(parsed.phonetic ?? ''),
        example: String(parsed.example ?? ''),
        exampleTranslation: String(parsed.exampleTranslation ?? ''),
        category: String(parsed.category ?? 'Objeto'),
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
      };
    } catch (e) {
      if (e instanceof AnalyzeError && e.code === 'no_object') throw e;
      // Try next model on network/parse error
    }
  }

  if (lastStatus === 429) throw new AnalyzeError('limit', 'Rate limit reached');
  throw new AnalyzeError('unknown', `Gemini unavailable (last status ${lastStatus})`);
}

export async function analyzeImage(
  uri: string,
  language: LangCode,
  fallbackBase64?: string,
): Promise<AnalyzeResult> {
  const prepared = await prepareImage(uri, fallbackBase64);
  const geminiKey = await getStoredGeminiKey();

  // 1. Direct Gemini Vision API when a Gemini API key is configured in .env.local or Perfil
  if (geminiKey && prepared.base64) {
    const analysis = await analyzeWithGeminiDirect(prepared.base64, language, geminiKey);
    return { analysis, processedUri: prepared.uri || uri };
  }

  // 2. Supabase Edge Function ('analyze-object') when deployed
  if (isSupabaseConfigured && supabase && prepared.base64) {
    const { data, error } = await supabase.functions.invoke('analyze-object', {
      body: {
        image: prepared.base64,
        mimeType: 'image/jpeg',
        language,
        nativeLanguage: 'es',
      },
    });

    if (!error && data && !data.error) {
      return { analysis: data as Analysis, processedUri: prepared.uri || uri };
    }
    if (error) {
      const status = (error as { context?: Response }).context?.status;
      if (status === 429) throw new AnalyzeError('limit', 'Daily limit reached');
    }
    if (data?.error === 'no_object') {
      throw new AnalyzeError('no_object', 'No object identified');
    }
  }

  // 3. Fallback demo mode: keep the user's real captured photo if they took one!
  await new Promise((r) => setTimeout(r, 950));
  const specimen = await getNextDemoSpecimen();
  const keepUserPhoto = Boolean(uri && !uri.includes('demo-'));
  return {
    analysis: specimen.analysis,
    processedUri: keepUserPhoto ? prepared.uri || uri : specimen.photoUri,
  };
}
