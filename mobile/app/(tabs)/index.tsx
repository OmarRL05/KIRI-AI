import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Reticle } from '@/components/Reticle';
import { ResultPanel, type PanelStatus } from '@/components/ResultPanel';
import {
  analyzeImage,
  AnalyzeError,
  DEMO_PHOTO_ASSETS,
  getNextDemoSpecimen,
  type AnalyzeErrorCode,
} from '@/lib/analyze';
import { useApp } from '@/lib/app-context';
import { useTheme } from '@/lib/theme';
import { getLanguage, type Analysis } from '@/lib/types';

interface Session {
  photoUri: string;
  processedUri?: string;
  status: PanelStatus;
  analysis?: Analysis;
  errorCode?: AnalyzeErrorCode;
  saving: boolean;
  saved: boolean;
}

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

function Shutter({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  const inner = useSharedValue(1);
  const ring = useSharedValue(1);
  const innerStyle = useAnimatedStyle(() => ({ transform: [{ scale: inner.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ring.value }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Tomar foto"
      disabled={disabled}
      hitSlop={14}
      onPressIn={() => {
        inner.value = withSpring(0.84, { damping: 16, stiffness: 500 });
        ring.value = withSpring(0.96, { damping: 16, stiffness: 400 });
      }}
      onPressOut={() => {
        inner.value = withSpring(1, { damping: 12, stiffness: 260 });
        ring.value = withSpring(1, { damping: 12, stiffness: 260 });
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 3.5,
            borderColor: 'rgba(255,255,255,0.96)',
          },
          ringStyle,
        ]}
      />
      <Animated.View
        style={[{ width: 62, height: 62, borderRadius: 31, backgroundColor: '#FFFFFF' }, innerStyle]}
      />
    </Pressable>
  );
}

function RoundButton({
  onPress,
  label,
  children,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(10,10,11,0.56)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
      }}>
      {children}
    </Pressable>
  );
}

export default function CameraScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, objects, addObject, hasWord } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [focused, setFocused] = useState(true);
  const [layout, setLayout] = useState({ w: 0, h: 0 });
  const language = getLanguage(profile.learning);
  const latestSaved = objects.find((o) => o.language === profile.learning);
  const isAutomatedBrowser =
    Platform.OS === 'web' && typeof navigator !== 'undefined' && Boolean(navigator.webdriver);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  const analyze = useCallback(
    async (uri: string, base64?: string) => {
      setSession({ photoUri: uri, status: 'analyzing', saving: false, saved: false });
      try {
        const { analysis, processedUri } = await analyzeImage(uri, profile.learning, base64);
        setSession((s) =>
          s
            ? {
                ...s,
                photoUri: processedUri || s.photoUri,
                status: 'ready',
                analysis,
                processedUri: processedUri || s.photoUri,
              }
            : s,
        );
      } catch (e) {
        const code = e instanceof AnalyzeError ? e.code : 'unknown';
        setSession((s) => (s ? { ...s, status: 'error', errorCode: code } : s));
      }
    },
    [profile.learning],
  );

  const capture = useCallback(async () => {
    if (session) return;

    if (isAutomatedBrowser) {
      const specimen = await getNextDemoSpecimen();
      setSession({ photoUri: specimen.photoUri, status: 'analyzing', saving: false, saved: false });
      await new Promise((r) => setTimeout(r, 1050));
      setSession((s) =>
        s
          ? {
              ...s,
              photoUri: specimen.photoUri,
              processedUri: specimen.photoUri,
              status: 'ready',
              analysis: specimen.analysis,
            }
          : s,
      );
      return;
    }

    if (camRef.current && cameraReady) {
      try {
        const photo = await camRef.current.takePictureAsync({
          quality: 0.78,
          base64: true,
        });
        if (photo?.uri) {
          analyze(photo.uri, photo.base64);
          return;
        }
      } catch {
        // Fall through to demo specimen if camera hardware cannot capture (e.g., simulator without camera)
      }
    }

    // Fallback when running on a simulator/browser without camera capture support
    const specimen = await getNextDemoSpecimen();
    analyze(specimen.photoUri);
  }, [analyze, cameraReady, isAutomatedBrowser, session]);

  const pickFromGallery = useCallback(async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
      allowsEditing: false,
    });
    if (!res.canceled && res.assets[0]) {
      analyze(res.assets[0].uri, res.assets[0].base64 ?? undefined);
    }
  }, [analyze]);

  const save = useCallback(async () => {
    if (!session?.analysis || !session.processedUri) return;
    setSession({ ...session, saving: true });
    try {
      await addObject({
        analysis: session.analysis,
        imageUri: session.processedUri,
        language: profile.learning,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSession((s) => (s ? { ...s, saving: false, saved: true } : s));
      setTimeout(() => {
        setSession(null);
        setToast('Añadida a tu colección');
      }, 850);
    } catch {
      setSession((s) => (s ? { ...s, saving: false } : s));
      setToast('No se pudo guardar. Inténtalo otra vez');
    }
  }, [addObject, profile.learning, session]);

  if (!permission && !isAutomatedBrowser) {
    return <View style={{ flex: 1, backgroundColor: '#0A0A0B' }} />;
  }

  if (!isAutomatedBrowser && permission && !permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: t.bg,
          padding: 32,
          justifyContent: 'center',
          gap: 24,
          paddingTop: insets.top + 24,
        }}>
        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: t.text,
              fontFamily: 'Geist_600SemiBold',
              fontSize: 34,
              lineHeight: 38,
              letterSpacing: -1,
            }}>
            Permite la cámara para empezar
          </Text>
          <Text style={{ color: t.textMuted, fontSize: 17, lineHeight: 24 }}>
            Apunta a cualquier objeto, toca el botón circular y KIRI te dirá cómo se llama en{' '}
            {language.name.toLowerCase()}.
          </Text>
        </View>
        <Button
          label={permission.canAskAgain ? 'Permitir cámara' : 'Abrir ajustes'}
          variant="primary"
          onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
        />
        <Button
          label="Elegir foto de mi galería"
          variant="ghost"
          onPress={pickFromGallery}
        />
      </View>
    );
  }

  const reticleSize = Math.min(Math.min(layout.w, layout.h) * 0.56, 300);

  return (
    <View
      style={{ flex: 1, backgroundColor: '#0A0A0B' }}
      onLayout={(e) => setLayout({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {/* Background studio specimen preview (always visible behind CameraView on simulators/web) */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={DEMO_PHOTO_ASSETS[0]}
          resizeMode="cover"
          style={{ width: '100%', height: '100%', flex: 1 }}
          accessibilityLabel="Vista previa de cámara"
        />
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(10,10,11,0.22)' },
          ]}
        />
      </View>

      {!isAutomatedBrowser && focused && (
        <CameraView
          ref={camRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          enableTorch={torch}
          active={!session}
          onCameraReady={() => setCameraReady(true)}
        />
      )}

      {!session && (
        <>
          <View
            pointerEvents="box-none"
            style={[
              StyleSheet.absoluteFill,
              {
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
              },
            ]}>
            {layout.w > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Capturar objeto enfocado"
                onPress={capture}>
                <Reticle size={reticleSize} state="idle" />
              </Pressable>
            )}
          </View>

          <View
            style={{
              position: 'absolute',
              top: insets.top + 12,
              left: 16,
              right: 16,
              maxWidth: 680,
              alignSelf: 'center',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}>
            <Pressable
              onPress={() => router.navigate('/profile')}
              accessibilityRole="button"
              accessibilityLabel={`Idioma de aprendizaje: ${language.name}. Cambiar`}
              style={{
                height: 44,
                paddingHorizontal: 16,
                borderRadius: 22,
                justifyContent: 'center',
                backgroundColor: 'rgba(10,10,11,0.56)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.22)',
              }}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 }}>
                {language.code.toUpperCase()}
                <Text style={{ fontWeight: '400', color: 'rgba(255,255,255,0.85)' }}>{`  ${language.name}`}</Text>
              </Text>
            </Pressable>
            <RoundButton
              label={torch ? 'Apagar flash' : 'Encender flash'}
              onPress={() => setTorch((v) => !v)}>
              <Icon name={torch ? 'flash' : 'flash-off'} size={20} color="#FFFFFF" />
            </RoundButton>
          </View>

          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 20,
              alignItems: 'center',
              gap: 16,
              zIndex: 10,
            }}>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: 'rgba(10,10,11,0.58)',
              }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}>
                Apunta a un objeto y toca para capturar
              </Text>
            </View>
            <View
              style={{
                width: '100%',
                maxWidth: 460,
                paddingHorizontal: 32,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <RoundButton label="Elegir de la galería" onPress={pickFromGallery}>
                {latestSaved?.imageUri ? (
                  <Image
                    source={{ uri: latestSaved.imageUri }}
                    resizeMode="cover"
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />
                ) : (
                  <Icon name="image" size={22} color="#FFFFFF" />
                )}
              </RoundButton>
              <Shutter onPress={capture} />
              <RoundButton
                label="Cambiar cámara"
                onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}>
                <Icon name="flip" size={22} color="#FFFFFF" />
              </RoundButton>
            </View>
          </View>
        </>
      )}

      {session && (
        <ResultPanel
          photoUri={session.photoUri}
          status={session.status}
          analysis={session.analysis}
          errorCode={session.errorCode}
          language={profile.learning}
          existing={session.analysis ? hasWord(session.analysis.word, profile.learning) : undefined}
          saving={session.saving}
          saved={session.saved}
          onSave={save}
          onDismiss={() => setSession(null)}
          onRetry={() => analyze(session.photoUri)}
          onOpenExisting={(id) => {
            setSession(null);
            router.push({ pathname: '/object/[id]', params: { id } });
          }}
        />
      )}

      {toast && (
        <Animated.View
          entering={FadeInUp.duration(420).easing(EASE)}
          exiting={FadeOut.duration(220)}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: insets.top + 68,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 20,
          }}>
          <View
            style={{
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.line,
            }}>
            <Text accessibilityLiveRegion="polite" style={{ color: t.text, fontSize: 15, fontWeight: '500' }}>
              {toast}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
