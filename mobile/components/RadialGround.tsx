import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/lib/theme';

/**
 * Soft radial neutral luminance field behind framed specimen cards, matching
 * the Monochrome Product Marketing canon (OWN-WORLD).
 */
export function RadialGround() {
  const t = useTheme();
  const inner = t.scheme === 'dark' ? '#1E1E24' : '#ECECEF';
  const outer = t.bg;
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
      <Defs>
        <RadialGradient id="kiriRadial" cx="50%" cy="28%" rx="65%" ry="48%">
          <Stop offset="0%" stopColor={inner} stopOpacity="1" />
          <Stop offset="62%" stopColor={inner} stopOpacity="0.45" />
          <Stop offset="100%" stopColor={outer} stopOpacity="1" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill={outer} />
      <Rect x="0" y="0" width="100" height="100" fill="url(#kiriRadial)" />
    </Svg>
  );
}
