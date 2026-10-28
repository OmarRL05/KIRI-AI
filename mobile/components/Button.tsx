import * as Haptics from 'expo-haptics';
import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  /** Draws the accent ring used for the audio-playing state. */
  active?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Primary fills with the accent; ghost is a hairline outline. 52pt tall. */
export function Button({
  label,
  onPress,
  variant = 'ghost',
  loading,
  disabled,
  active,
  icon,
  style,
  accessibilityHint,
}: Props) {
  const t = useTheme();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const primary = variant === 'primary';
  const fg = primary ? t.onAccent : active ? t.accent : t.text;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 420 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 300 });
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={[
        {
          minHeight: 52,
          borderRadius: 16,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: primary ? t.accent : 'transparent',
          borderWidth: primary ? 0 : 1,
          borderColor: active ? t.accent : t.line,
          opacity: disabled ? 0.45 : 1,
        },
        animated,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon}
          <Text
            maxFontSizeMultiplier={1.3}
            style={{
              color: fg,
              fontFamily: 'Geist_600SemiBold',
              fontSize: 16,
              fontWeight: '600',
              letterSpacing: -0.1,
            }}>
            {label}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}
