import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

interface WordProps {
  word: string;
  index: number;
  fontSize: number;
  lineHeight: number;
  maskHeight: number;
  color: string;
  family: string;
  letterSpacing: number;
  delay: number;
  run: boolean;
}

function RisingWord({
  word,
  index,
  fontSize,
  lineHeight,
  maskHeight,
  color,
  family,
  letterSpacing,
  delay,
  run,
}: WordProps) {
  const reduced = useReducedMotion();
  const y = useSharedValue(reduced ? 0 : maskHeight * 1.05);
  const opacity = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      opacity.value = withTiming(run ? 1 : 0, { duration: 160 });
      return;
    }
    if (run) {
      const d = delay + index * 85;
      y.value = withDelay(d, withTiming(0, { duration: 720, easing: EASE }));
      opacity.value = withDelay(d, withTiming(1, { duration: 300 }));
    } else {
      y.value = maskHeight * 1.05;
      opacity.value = 0;
    }
  }, [run, reduced, delay, index, maskHeight, y, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <View
      style={{
        minHeight: maskHeight,
        paddingBottom: Math.round(fontSize * 0.14),
        overflow: 'hidden',
      }}>
      <Animated.View style={style}>
        <Text
          maxFontSizeMultiplier={1.35}
          style={{
            fontFamily: family,
            fontSize,
            lineHeight,
            color,
            letterSpacing,
            fontWeight: '600',
          }}>
          {word}
        </Text>
      </Animated.View>
    </View>
  );
}

interface Props {
  text: string;
  color: string;
  run: boolean;
  fontSize?: number;
  delay?: number;
}

/**
 * The word is the reward: each word rises from its own baseline through a
 * generous mask that preserves descenders (g, y, p, q, j) and Dynamic Type.
 */
export function WordReveal({ text, color, run, fontSize = 50, delay = 0 }: Props) {
  const lineHeight = Math.round(fontSize * 1.18);
  const maskHeight = Math.round(fontSize * 1.24);
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={text}
      style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: fontSize * 0.24 }}>
      {words.map((w, i) => (
        <RisingWord
          key={`${w}-${i}`}
          word={w}
          index={i}
          fontSize={fontSize}
          lineHeight={lineHeight}
          maskHeight={maskHeight}
          color={color}
          family="Geist_600SemiBold"
          letterSpacing={-fontSize * 0.03}
          delay={delay}
          run={run}
        />
      ))}
    </View>
  );
}
