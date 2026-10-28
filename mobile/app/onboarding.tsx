import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { WordReveal } from '@/components/WordReveal';
import { DEMO_PHOTO_ASSETS } from '@/lib/analyze';
import { useApp } from '@/lib/app-context';
import { ACCENT } from '@/lib/theme';
import { LANGUAGES, getLanguage } from '@/lib/types';

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

const SPECIMENS = [
  {
    source: DEMO_PHOTO_ASSETS[1],
    word: 'coffee cup',
    translation: 'taza de café',
    phonetic: '/ˈkɒfi kʌp/',
  },
  {
    source: DEMO_PHOTO_ASSETS[0],
    word: 'keyboard',
    translation: 'teclado',
    phonetic: '/ˈkiːbɔːd/',
  },
  {
    source: DEMO_PHOTO_ASSETS[2],
    word: 'backpack',
    translation: 'mochila',
    phonetic: '/ˈbækpæk/',
  },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { profile, setLearning, finishOnboarding } = useApp();
  const lang = getLanguage(profile.learning);
  const [activeIdx, setActiveIdx] = useState(0);

  // Subtle Ken Burns breathing zoom on the hero background photograph
  const zoom = useSharedValue(1);
  useEffect(() => {
    zoom.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 6500, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 6500, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [zoom]);

  // Auto-cycle hero specimen every 5.2 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SPECIMENS.length);
    }, 5200);
    return () => clearInterval(id);
  }, []);

  const kenBurnsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoom.value }],
  }));

  const heroHeight = Math.max(410, Math.round(height * 0.57));
  const activeSpecimen = SPECIMENS[activeIdx];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
        }}>
        {/* Top Hero Image Stage with Gradient Melt to Solid White */}
        <View style={{ height: heroHeight, width: '100%', overflow: 'hidden' }}>
          <Animated.View
            key={activeSpecimen.word}
            entering={FadeIn.duration(650)}
            exiting={FadeOut.duration(450)}
            style={[StyleSheet.absoluteFill, kenBurnsStyle]}>
            <Image
              source={activeSpecimen.source}
              resizeMode="cover"
              style={{ width: '100%', height: '100%', flex: 1 }}
              accessibilityLabel={activeSpecimen.word}
            />
          </Animated.View>

          {/* Top dark scrim + bottom smooth dissolve into solid white (#FFFFFF) */}
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Svg width="100%" height="100%" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="onbTopScrim" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#0A0A0B" stopOpacity="0.72" />
                  <Stop offset="0.38" stopColor="#0A0A0B" stopOpacity="0.48" />
                  <Stop offset="0.68" stopColor="#0A0A0B" stopOpacity="0.22" />
                  <Stop offset="1" stopColor="#0A0A0B" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="onbBottomMelt" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                  <Stop offset="0.52" stopColor="#FFFFFF" stopOpacity="0" />
                  <Stop offset="0.66" stopColor="#FFFFFF" stopOpacity="0.18" />
                  <Stop offset="0.78" stopColor="#FFFFFF" stopOpacity="0.52" />
                  <Stop offset="0.89" stopColor="#FFFFFF" stopOpacity="0.86" />
                  <Stop offset="0.96" stopColor="#FFFFFF" stopOpacity="0.98" />
                  <Stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#onbTopScrim)" />
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#onbBottomMelt)" />
            </Svg>
          </View>

          {/* Large app name + display headline positioned inside the photograph stage */}
          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
              paddingHorizontal: 28,
              paddingTop: insets.top + 18,
              paddingBottom: 38,
            }}>
            <Animated.View
              entering={FadeInDown.duration(520).easing(EASE)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'Geist_600SemiBold',
                  fontSize: 30,
                  letterSpacing: -1,
                  fontWeight: '600',
                }}>
                KIRI
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: 'rgba(10,10,11,0.48)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.22)',
                }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: ACCENT }} />
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontFamily: 'Geist_600SemiBold',
                    fontSize: 13,
                    letterSpacing: -0.2,
                  }}>
                  {activeSpecimen.word}
                </Text>
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.78)',
                    fontFamily: 'Geist_500Medium',
                    fontSize: 13,
                  }}>
                  · {activeSpecimen.translation}
                </Text>
              </View>
            </Animated.View>

            <View style={{ gap: 10 }}>
              <WordReveal
                key={lang.code}
                text={`Aprende ${lang.name.toLowerCase()} con lo que ves.`}
                fontSize={42}
                color="#FFFFFF"
                run
                delay={80}
              />
              <Animated.Text
                entering={FadeInDown.delay(340).duration(540).easing(EASE)}
                style={{
                  color: '#71717A',
                  opacity: 0.9,
                  fontFamily: 'Geist_500Medium',
                  fontSize: 16,
                  lineHeight: 23,
                }}>
                Fotografía cualquier objeto. KIRI lo identifica con IA y lo guarda en tu colección.
              </Animated.Text>
            </View>
          </View>
        </View>

        {/* Bottom Solid White Stage (#FFFFFF) */}
        <Animated.View
          entering={FadeInDown.delay(420).duration(560).easing(EASE)}
          style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 28,
            paddingTop: 4,
            paddingBottom: Math.max(insets.bottom + 18, 24),
            justifyContent: 'space-between',
            gap: 16,
          }}>
          {/* Interactive specimen switcher chips on the white ground */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {SPECIMENS.map((item, idx) => {
              const selected = idx === activeIdx;
              return (
                <Pressable
                  key={item.word}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver ejemplo ${item.word}`}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveIdx(idx);
                  }}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    padding: 6,
                    paddingRight: 10,
                    borderRadius: 999,
                    backgroundColor: selected ? '#F4F4F5' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: selected ? '#0A0A0B' : '#E4E4E7',
                  }}>
                  <Image
                    source={item.source}
                    resizeMode="cover"
                    style={{ width: 28, height: 28, borderRadius: 14 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: '#0A0A0B',
                        fontFamily: 'Geist_600SemiBold',
                        fontSize: 12,
                        letterSpacing: -0.2,
                      }}>
                      {item.word}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: '#71717A',
                        fontFamily: 'Geist_500Medium',
                        fontSize: 10,
                      }}>
                      {item.translation}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={{ gap: 10 }}>
            <Text style={{ color: '#71717A', fontFamily: 'Geist_500Medium', fontSize: 14 }}>
              Quiero aprender
            </Text>
            <View
              accessibilityRole="radiogroup"
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {LANGUAGES.map((l) => {
                const on = l.code === profile.learning;
                return (
                  <Pressable
                    key={l.code}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setLearning(l.code);
                    }}
                    style={{
                      minHeight: 42,
                      paddingHorizontal: 15,
                      borderRadius: 999,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: on ? '#0A0A0B' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: on ? '#0A0A0B' : '#E4E4E7',
                    }}>
                    {on && <Icon name="check" size={15} color="#FFFFFF" strokeWidth={2.2} />}
                    <Text
                      style={{
                        color: on ? '#FFFFFF' : '#0A0A0B',
                        fontFamily: 'Geist_500Medium',
                        fontSize: 14,
                        fontWeight: '500',
                      }}>
                      {l.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Button
            label="Empezar"
            variant="primary"
            icon={<Icon name="arrow-right" size={20} color="#FFFFFF" />}
            onPress={finishOnboarding}
          />
        </Animated.View>
      </View>
    </View>
  );
}
