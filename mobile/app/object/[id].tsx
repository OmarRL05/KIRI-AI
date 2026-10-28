import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { RadialGround } from '@/components/RadialGround';
import { WordReveal } from '@/components/WordReveal';
import { useApp } from '@/lib/app-context';
import { useSpeak } from '@/lib/speech';
import { ACCENT, useTheme } from '@/lib/theme';

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

export default function ObjectDetail() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { objects, setLearned, removeObject } = useApp();
  const { speak, speaking } = useSpeak();
  const item = objects.find((o) => o.id === id);

  if (!item) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: t.bg,
          padding: 32,
          justifyContent: 'center',
          gap: 20,
        }}>
        <Text style={{ color: t.text, fontSize: 20, fontWeight: '600' }}>
          Este objeto ya no existe
        </Text>
        <Button label="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert('¿Eliminar de tu colección?', `“${item.word}” y su foto se borrarán.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await removeObject(item.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <RadialGround />
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: insets.top + 14,
          paddingBottom: insets.bottom + 32,
          gap: 20,
          width: '100%',
          maxWidth: 540,
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}>
        {/* Gradient-Melt Specimen Card */}
        <Animated.View
          entering={FadeInDown.duration(560).easing(EASE)}
          style={{
            width: '100%',
            borderRadius: 32,
            overflow: 'hidden',
            backgroundColor: t.surface,
            borderWidth: 1.5,
            borderColor: t.line,
          }}>
          <View style={{ width: '100%', aspectRatio: 1.05, position: 'relative' }}>
            {item.imageUri ? (
              <Image
                source={{ uri: item.imageUri }}
                resizeMode="cover"
                style={{ width: '100%', height: '100%', flex: 1 }}
                accessibilityLabel={`Foto de ${item.word}`}
              />
            ) : null}

            {/* Smooth gradient melt into card surface */}
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Svg width="100%" height="100%" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="detailPhotoMelt" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={t.surface} stopOpacity="0" />
                    <Stop offset="0.48" stopColor={t.surface} stopOpacity="0" />
                    <Stop offset="0.64" stopColor={t.surface} stopOpacity="0.22" />
                    <Stop offset="0.78" stopColor={t.surface} stopOpacity="0.62" />
                    <Stop offset="0.91" stopColor={t.surface} stopOpacity="0.92" />
                    <Stop offset="1" stopColor={t.surface} stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#detailPhotoMelt)" />
              </Svg>
            </View>

            {/* Top Category Pill & Close Button */}
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
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: item.learned ? '#22C55E' : ACCENT,
                  }}
                />
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontFamily: 'Geist_500Medium',
                    fontSize: 13,
                    fontWeight: '500',
                  }}>
                  {item.category} ·{' '}
                  {new Date(item.createdAt).toLocaleDateString('es', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>

              <Pressable
                onPress={() => router.back()}
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

          <View
            style={{
              paddingHorizontal: 24,
              paddingBottom: 24,
              marginTop: -22,
              gap: 14,
            }}>
            <WordReveal text={item.word} color={t.text} fontSize={46} run delay={80} />
            <Animated.View
              entering={FadeInDown.delay(220).duration(480).easing(EASE)}
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
                    fontWeight: '500',
                    letterSpacing: -0.4,
                  }}>
                  {item.translation}
                </Text>
                <Text style={{ color: t.textMuted, fontSize: 17 }}>{item.phonetic}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: t.line }} />
              <View style={{ gap: 5 }}>
                <Text style={{ color: t.text, fontSize: 18, lineHeight: 25 }}>
                  “{item.example}”
                </Text>
                <Text style={{ color: t.textMuted, fontSize: 16, lineHeight: 23 }}>
                  {item.exampleTranslation}
                </Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(340).duration(480).easing(EASE)}
          style={{ gap: 12 }}>
          <Button
            label="Escuchar"
            active={speaking}
            icon={<Icon name="volume" size={20} color={speaking ? t.accent : t.text} />}
            onPress={() => speak(item.word, item.language)}
          />
          <Button
            label={item.learned ? 'Aprendida' : 'Marcar como aprendida'}
            icon={item.learned ? <Icon name="check" size={20} color={t.text} /> : undefined}
            onPress={() => setLearned(item.id, !item.learned)}
          />
          <Pressable
            onPress={confirmDelete}
            accessibilityRole="button"
            accessibilityLabel="Eliminar de la colección"
            style={{
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
            }}>
            <Icon name="trash" size={18} color={t.danger} />
            <Text style={{ color: t.danger, fontSize: 15, fontWeight: '500' }}>Eliminar</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
