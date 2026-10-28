import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/lib/theme';

export type ReticleState = 'idle' | 'locking' | 'error';

interface Props {
  size: number;
  state: ReticleState;
}

const ARM = 28;
const R = 12;
const STROKE = 3;

/**
 * Four corner brackets rendered via SVG so strokes are crisp and reliable on
 * iOS, Android, and Web. Idle: white, breathing. Locking: contract onto the
 * subject in electric blue (#2F6BFF).
 */
export function Reticle({ size, state }: Props) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const lock = useSharedValue(0);
  const breathe = useSharedValue(0);
  const pulse = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    breathe.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [reduced, breathe]);

  useEffect(() => {
    if (state === 'locking') {
      lock.value = withSpring(1, { damping: 16, stiffness: 180, mass: 0.9 });
      if (!reduced) {
        pulse.value = withRepeat(
          withSequence(
            withTiming(0.55, { duration: 700, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
        );
      }
    } else {
      pulse.value = withTiming(1, { duration: 200 });
      lock.value = withTiming(0, { duration: 420, easing: Easing.bezier(0.16, 1, 0.3, 1) });
      if (state === 'error' && !reduced) {
        shake.value = withSequence(
          withTiming(-10, { duration: 60 }),
          withTiming(10, { duration: 90 }),
          withTiming(-6, { duration: 80 }),
          withTiming(0, { duration: 80 }),
        );
      }
    }
  }, [state, reduced, lock, pulse, shake]);

  const frame = useAnimatedStyle(() => {
    const s = interpolate(lock.value, [0, 1], [1 + breathe.value * 0.025, 0.8]);
    return {
      opacity: pulse.value,
      transform: [{ scale: s }, { translateX: shake.value }],
    };
  });

  const s = Math.max(80, Math.round(size));
  const p = STROKE;
  const d = [
    // top-left
    `M ${p} ${p + ARM} L ${p} ${p + R} Q ${p} ${p} ${p + R} ${p} L ${p + ARM} ${p}`,
    // top-right
    `M ${s - p - ARM} ${p} L ${s - p - R} ${p} Q ${s - p} ${p} ${s - p} ${p + R} L ${s - p} ${p + ARM}`,
    // bottom-left
    `M ${p} ${s - p - ARM} L ${p} ${s - p - R} Q ${p} ${s - p} ${p + R} ${s - p} L ${p + ARM} ${s - p}`,
    // bottom-right
    `M ${s - p - ARM} ${s - p} L ${s - p - R} ${s - p} Q ${s - p} ${s - p} ${s - p} ${s - p - R} L ${s - p} ${s - p - ARM}`,
  ].join(' ');

  const strokeColor =
    state === 'locking' ? t.accent : state === 'error' ? t.danger : 'rgba(255,255,255,0.95)';

  return (
    <View pointerEvents="none" style={{ width: s, height: s }}>
      <Animated.View style={[{ width: s, height: s }, frame]}>
        <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <Path
            d={d}
            stroke={strokeColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
