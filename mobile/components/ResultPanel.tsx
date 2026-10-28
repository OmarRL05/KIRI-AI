import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { AnalyzeMessages, type AnalyzeErrorCode } from '@/lib/analyze';
import { useSpeak } from '@/lib/speech';
import { ACCENT, useTheme } from '@/lib/theme';
import { type Analysis, type CollectedObject, type LangCode } from '@/lib/types';
import { Button } from './Button';
import { Icon } from './Icon';
import { PhotoBlobLoader } from './PhotoBlobLoader';
import { RadialGround } from './RadialGround';
import { WordReveal } from './WordReveal';

export type PanelStatus = 'analyzing' | 'ready' | 'error';

interface Props {
  photoUri: string;
  status: PanelStatus;
  analysis?: Analysis;
  errorCode?: AnalyzeErrorCode;
  language: LangCode;
  existing?: CollectedObject;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  onDismiss: () => void;
  onRetry: () => void;
  onOpenExisting: (id: string) => void;
}

const MIN_BLOB_DURATION_MS = 2600;
const COALESCE_DURATION_MS = 450;

/**
 * Choreography:
 * 1. Capture flash -> full-bleed photo dissolves into the solid app background (t.bg).
 * 2. PhotoBlobLoader morphs the captured photo inside a 3-bulb liquid metaball.
 * 3. When analysis finishes, the 3 bulbs coalesce in the center and expand to
 *    assemble the Gradient-Melt Specimen Card over the solid background.
 */
export function ResultPanel({
  photoUri,
  status,
  analysis,
  errorCode,
  language,
  existing,
  saving,
  saved,
  onSave,
  onDismiss,
  onRetry,
  onOpenExisting,
}: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { speak, speaking } = useSpeak();

  const mountTimeRef = useRef(Date.now());
  const [phase, setPhase] = useState<'blob' | 'coalescing' | 'card'>('blob');

  // Initial flash-fade of the full-screen camera frame into the solid background
  const flashPhotoOpacity = useSharedValue(1);
  const cardScale = useSharedValue(0.84);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    mountTimeRef.current = Date.now();
    setPhase('blob');
    flashPhotoOpacity.value = 1;
    flashPhotoOpacity.value = withTiming(0, {
      duration: 340,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
  }, [photoUri, flashPhotoOpacity]);

  const ready = status === 'ready' && !!analysis;

  useEffect(() => {
    if (status === 'analyzing') {
      setPhase('blob');
      cardScale.value = 0.84;
      cardOpacity.value = 0;
      return;
    }

    if (status === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPhase('card');
      return;
    }

    if (ready) {
      const elapsed = Date.now() - mountTimeRef.current;
      const waitMs = reduced ? 0 : Math.max(0, MIN_BLOB_DURATION_MS - elapsed);

      const t1 = setTimeout(() => {
        setPhase('coalescing');
      }, waitMs);

      const t2 = setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhase('card');
        cardOpacity.value = withTiming(1, { duration: 280 });
        cardScale.value = reduced
          ? withTiming(1, { duration: 180 })
          : withSpring(1, { damping: 18, stiffness: 170, mass: 0.85 });
      }, waitMs + (reduced ? 0 : COALESCE_DURATION_MS));

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [ready, status, reduced, cardOpacity, cardScale]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashPhotoOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: t.bg,
          zIndex: 30,
        },
      ]}>
      <RadialGround />

      {/* Phase 0: Brief initial dissolve from the captured camera frame into the solid background */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, flashStyle]}>
        <Image
          source={{ uri: photoUri }}
          resizeMode="cover"
          style={{ width: '100%', height: '100%', flex: 1 }}
        />
      </Animated.View>

      {/* Phase 1 & 2: Liquid Metaball Photo Blob Loader while AI thinks & coalesces */}
      {phase !== 'card' && status !== 'error' && (
        <PhotoBlobLoader photoUri={photoUri} coalescing={phase === 'coalescing'} />
      )}

      {/* Top-right close button during blob loading */}
      {phase !== 'card' && (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Cancelar análisis"
          hitSlop={8}
          style={{
            position: 'absolute',
            top: insets.top + 16,
            right: 20,
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.line,
            zIndex: 40,
          }}>
          <Icon name="x" size={20} color={t.text} />
        </Pressable>
      )}

      {/* Error State */}
      {status === 'error' && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            maxWidth: 520,
            width: '100%',
            alignSelf: 'center',
          }}>
          <Animated.View
            entering={FadeInDown.duration(420).easing(Easing.bezier(0.16, 1, 0.3, 1))}
            style={{
              padding: 24,
              gap: 18,
              borderRadius: 28,
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.line,
            }}>
            <View style={{ gap: 6 }}>
              <Text
                style={{
                  color: t.text,
                  fontFamily: 'Geist_600SemiBold',
                  fontSize: 22,
                  letterSpacing: -0.4,
                }}>
                {AnalyzeMessages[errorCode ?? 'unknown'].title}
              </Text>
              <Text style={{ color: t.textMuted, fontSize: 16, lineHeight: 23 }}>
                {AnalyzeMessages[errorCode ?? 'unknown'].body}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button label="Descartar" onPress={onDismiss} style={{ flex: 1 }} />
              {errorCode !== 'unconfigured' && (
                <Button
                  label="Reintentar"
                  variant="primary"
                  onPress={onRetry}
                  style={{ flex: 1.3 }}
                />
              )}
            </View>
          </Animated.View>
        </View>
      )}

      {/* Phase 3: Assembled Gradient-Melt Specimen Card */}
      {phase === 'card' && ready && analysis && (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: insets.top + 12,
            paddingBottom: Math.max(insets.bottom + 16, 20),
            maxWidth: 540,
            width: '100%',
            alignSelf: 'center',
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              {
                borderRadius: 32,
                overflow: 'hidden',
                backgroundColor: t.surface,
                borderWidth: 1.5,
                borderColor: t.line,
              },
              cardAnimatedStyle,
            ]}>
            {/* Upper Photo Stage with Smooth Gradient Melt into Card Surface */}
            <View style={{ width: '100%', aspectRatio: 1.05, position: 'relative' }}>
              <Image
                source={{ uri: photoUri }}
                resizeMode="cover"
                style={{ width: '100%', height: '100%', flex: 1 }}
                accessibilityLabel={`Foto de ${analysis.word}`}
              />

              {/* Multi-stop gradient melting the bottom of the photo into t.surface */}
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                <Svg width="100%" height="100%" preserveAspectRatio="none">
                  <Defs>
                    <LinearGradient id="cardPhotoMelt" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={t.surface} stopOpacity="0" />
                      <Stop offset="0.48" stopColor={t.surface} stopOpacity="0" />
                      <Stop offset="0.64" stopColor={t.surface} stopOpacity="0.22" />
                      <Stop offset="0.78" stopColor={t.surface} stopOpacity="0.62" />
                      <Stop offset="0.91" stopColor={t.surface} stopOpacity="0.92" />
                      <Stop offset="1" stopColor={t.surface} stopOpacity="1" />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width="100%" height="100%" fill="url(#cardPhotoMelt)" />
                </Svg>
              </View>

              {/* Top Category Badge & Close Button */}
              <View
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  right: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 7,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: 'rgba(10,10,11,0.52)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.22)',
                  }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: ACCENT }} />
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontFamily: 'Geist_500Medium',
                      fontSize: 13,
                      fontWeight: '500',
                    }}>
                    {analysis.category}
                  </Text>
                </View>

                <Pressable
                  onPress={onDismiss}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                  hitSlop={8}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(10,10,11,0.52)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.22)',
                  }}>
                  <Icon name="x" size={19} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>

            {/* Lower Card Body (over solid t.surface after the gradient melt) */}
            <View
              style={{
                paddingHorizontal: 24,
                paddingBottom: 24,
                marginTop: -22,
                gap: 14,
              }}>
              <WordReveal text={analysis.word} color={t.text} fontSize={46} run delay={80} />

              <Animated.View
                entering={FadeInDown.delay(reduced ? 0 : 240)
                  .duration(480)
                  .easing(Easing.bezier(0.16, 1, 0.3, 1))}
                style={{ gap: 12 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}>
                  <Text
                    style={{
                      color: t.text,
                      fontFamily: 'Geist_500Medium',
                      fontSize: 23,
                      letterSpacing: -0.4,
                      fontWeight: '500',
                    }}>
                    {analysis.translation}
                  </Text>
                  <Text style={{ color: t.textMuted, fontSize: 16 }}>{analysis.phonetic}</Text>
                </View>

                <View style={{ height: 1, backgroundColor: t.line }} />

                <View style={{ gap: 4 }}>
                  <Text style={{ color: t.text, fontSize: 17, lineHeight: 24 }}>
                    “{analysis.example}”
                  </Text>
                  <Text style={{ color: t.textMuted, fontSize: 15, lineHeight: 22 }}>
                    {analysis.exampleTranslation}
                  </Text>
                </View>

                {analysis.demo && (
                  <Text style={{ color: t.textSubtle, fontSize: 13 }}>
                    Modo demo: resultado de ejemplo.
                  </Text>
                )}
              </Animated.View>
            </View>
          </Animated.View>

          {/* Bottom Action Row */}
          <Animated.View
            entering={FadeInDown.delay(reduced ? 0 : 340)
              .duration(480)
              .easing(Easing.bezier(0.16, 1, 0.3, 1))}
            exiting={FadeOut.duration(180)}
            style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              label="Escuchar"
              active={speaking}
              icon={<Icon name="volume" size={20} color={speaking ? t.accent : t.text} />}
              onPress={() => speak(analysis.word, language)}
              style={{ flex: 1 }}
            />
            {existing ? (
              <Button
                label="Ver en colección"
                variant="primary"
                onPress={() => onOpenExisting(existing.id)}
                style={{ flex: 1.3 }}
              />
            ) : (
              <Button
                label={saved ? 'Guardado' : 'Guardar'}
                variant="primary"
                loading={saving}
                icon={saved ? <Icon name="check" size={20} color={t.onAccent} /> : undefined}
                onPress={saved ? undefined : onSave}
                style={{ flex: 1.3, opacity: 1 }}
              />
            )}
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}
