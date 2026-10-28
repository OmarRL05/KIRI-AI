import * as Haptics from 'expo-haptics';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';
import type { CollectedObject } from '@/lib/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const DAY = 24 * 60 * 60 * 1000;

interface Props {
  item: CollectedObject;
  index: number;
  width: number;
  onPress: () => void;
}

/** Claim beside proof: the photo, then the word it earned. */
export function ObjectTile({ item, index, width, onPress }: Props) {
  const t = useTheme();
  const scale = useSharedValue(1);
  const press = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isNew = !item.learned && Date.now() - new Date(item.createdAt).getTime() < DAY;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 10) * 45)
        .duration(560)
        .easing(Easing.bezier(0.16, 1, 0.3, 1))}
      layout={LinearTransition.duration(320).easing(Easing.bezier(0.16, 1, 0.3, 1))}
      style={{ width }}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={`${item.word}, ${item.translation}${item.learned ? ', aprendida' : ''}`}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 18, stiffness: 420 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 300 });
        }}
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        style={[{ width, gap: 10 }, press]}>
        <View
          style={{
            width,
            height: width * 1.22,
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: t.surfaceMuted,
            borderWidth: 1,
            borderColor: t.line,
          }}>
          {item.imageUri ? (
            <Image
              source={{ uri: item.imageUri }}
              resizeMode="cover"
              style={{ width: '100%', height: '100%', flex: 1 }}
            />
          ) : null}
        </View>
        <View style={{ gap: 2, paddingHorizontal: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              numberOfLines={1}
              style={{
                flexShrink: 1,
                color: t.text,
                fontFamily: 'Geist_600SemiBold',
                fontSize: 19,
                letterSpacing: -0.4,
              }}>
              {item.word}
            </Text>
            {isNew && (
              <View
                accessibilityLabel="Nueva"
                style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.accent }}
              />
            )}
          </View>
          <Text
            numberOfLines={1}
            style={{ color: t.textMuted, fontFamily: 'Geist_500Medium', fontSize: 14 }}>
            {item.translation}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}
