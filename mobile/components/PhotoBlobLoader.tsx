import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/lib/theme';

interface Props {
  photoUri: string;
  /** When true, the 3 bulbs converge into the center sphere and expand into the Specimen Card. */
  coalescing: boolean;
}

const STAGE = 280;
const CX = STAGE / 2;
const CY = STAGE / 2;

function circleSubpath(cx: number, cy: number, r: number): string {
  if (r < 1.5) return '';
  const x0 = (cx - r).toFixed(1);
  const x1 = (cx + r).toFixed(1);
  const y = cy.toFixed(1);
  const rf = r.toFixed(1);
  return `M ${x0} ${y} A ${rf} ${rf} 0 1 1 ${x1} ${y} A ${rf} ${rf} 0 1 1 ${x0} ${y} Z`;
}

/**
 * Generates a single non-self-intersecting closed SVG path for the connected
 * 3-bulb liquid metaball (used for both the organic rounded triangle and the
 * Y-shaped stretched metaball with pinched concave necks).
 */
function connectedTriBlob(
  cx: number,
  cy: number,
  dist: number,
  bulbR: number,
  neckR: number,
  alpha: number,
  baseAngle: number,
): string {
  if (dist < 3) {
    return circleSubpath(cx, cy, bulbR);
  }

  const TWO_PI = Math.PI * 2;
  const THIRD = TWO_PI / 3;
  const largeArc = alpha * 2 > Math.PI ? 1 : 0;
  const rf = bulbR.toFixed(1);

  let d = '';

  for (let i = 0; i < 3; i++) {
    const theta = baseAngle + i * THIRD;
    const nextTheta = baseAngle + ((i + 1) % 3) * THIRD;
    const midPhi = theta + THIRD * 0.5;

    const bx = cx + Math.cos(theta) * dist;
    const by = cy + Math.sin(theta) * dist;
    const nbx = cx + Math.cos(nextTheta) * dist;
    const nby = cy + Math.sin(nextTheta) * dist;

    const sAngle = theta - alpha;
    const eAngle = theta + alpha;
    const sx = bx + Math.cos(sAngle) * bulbR;
    const sy = by + Math.sin(sAngle) * bulbR;
    const ex = bx + Math.cos(eAngle) * bulbR;
    const ey = by + Math.sin(eAngle) * bulbR;

    const nsAngle = nextTheta - alpha;
    const nsx = nbx + Math.cos(nsAngle) * bulbR;
    const nsy = nby + Math.sin(nsAngle) * bulbR;

    if (i === 0) {
      d += `M ${sx.toFixed(1)} ${sy.toFixed(1)} `;
    }

    // Outer circular cap around bulb i
    d += `A ${rf} ${rf} 0 ${largeArc} 1 ${ex.toFixed(1)} ${ey.toFixed(1)} `;

    // Smooth concave cubic-bezier liquid neck dipping inward to radius neckR at midPhi
    const spreadPhi = 0.28;
    const c1x = cx + Math.cos(midPhi - spreadPhi) * neckR;
    const c1y = cy + Math.sin(midPhi - spreadPhi) * neckR;
    const c2x = cx + Math.cos(midPhi + spreadPhi) * neckR;
    const c2y = cy + Math.sin(midPhi + spreadPhi) * neckR;

    d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${nsx.toFixed(1)} ${nsy.toFixed(1)} `;
  }

  d += 'Z';
  return d;
}

/**
 * Liquid Metaball Photo Loader compatible with iOS Fabric (New Architecture), Android, and Web.
 *
 * Uses a top-level inverted even-odd SVG `<Path fill={t.bg} fillRule="evenodd" />` over
 * Reanimated `<Animated.View>` photo discs so iOS `RNSVGPathComponentView` updates the
 * liquid metaball silhouette on every frame while Reanimated animates the photo droplets
 * and scale transitions natively.
 */
export function PhotoBlobLoader({ photoUri, coalescing }: Props) {
  const t = useTheme();

  const stageScale = useSharedValue(2.05);
  const stageOpacity = useSharedValue(1);

  const b0x = useSharedValue(CX);
  const b0y = useSharedValue(CY);
  const b0r = useSharedValue(42);
  const b1x = useSharedValue(CX);
  const b1y = useSharedValue(CY);
  const b1r = useSharedValue(42);
  const b2x = useSharedValue(CX);
  const b2y = useSharedValue(CY);
  const b2r = useSharedValue(42);

  const startRef = useRef(Date.now());
  const coalesceStartRef = useRef<number | null>(null);

  const [paths, setPaths] = useState(() => {
    const init = circleSubpath(CX, CY, 52);
    return {
      cutout: `M 0 0 H ${STAGE} V ${STAGE} H 0 Z ${init}`,
      outline: init,
    };
  });

  useEffect(() => {
    stageScale.value = withTiming(1, {
      duration: 420,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
  }, [stageScale]);

  useEffect(() => {
    if (coalescing) {
      coalesceStartRef.current = Date.now();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      stageScale.value = withTiming(2.4, {
        duration: 450,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      stageOpacity.value = withTiming(0, {
        duration: 440,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
    }
  }, [coalescing, stageScale, stageOpacity]);

  useEffect(() => {
    let rafId = 0;
    let alive = true;

    const tick = () => {
      if (!alive) return;
      const now = Date.now();
      const elapsed = (now - startRef.current) / 1000;
      const cycle = 2.4;
      const p = (elapsed % cycle) / cycle;

      const baseAngle = elapsed * 1.45 - Math.PI * 0.5;
      const c =
        coalesceStartRef.current !== null
          ? Math.min(1, (now - coalesceStartRef.current) / 260)
          : 0;

      let innerPath = '';
      let dist = 0;
      let sR = 34;

      if (c > 0.01) {
        dist = 26 * (1 - c);
        sR = 34 + 34 * c;
        const neckR = 26 + 42 * c;
        const alpha = Math.PI * (0.54 - 0.20 * c);
        innerPath = connectedTriBlob(CX, CY, dist, sR, neckR, alpha, baseAngle);
      } else if (p < 0.25) {
        // Stage 1 (00:00 of reference): Organic rounded triangle blob pulsing in center
        const k = p / 0.25;
        const pulse = Math.sin(k * Math.PI);
        dist = 15 + pulse * 5;
        sR = 36 + pulse * 2;
        const neckR = 48 + pulse * 2;
        const alpha = Math.PI * 0.32;
        innerPath = connectedTriBlob(CX, CY, dist, sR, neckR, alpha, baseAngle);
      } else if (p < 0.55) {
        // Stage 2 (00:03-00:04 of reference): 3 bulbs stretch outward with deep pinched liquid necks
        const k = (p - 0.25) / 0.3;
        const ease = 0.5 - 0.5 * Math.cos(k * Math.PI);
        dist = 20 + ease * 36; // 20px -> 56px
        sR = 36 - ease * 7; // 36px -> 29px
        const neckR = 48 - ease * 39; // 48px -> 9px (deep liquid pinch!)
        const alpha = Math.PI * (0.32 + ease * 0.40); // 0.32pi -> 0.72pi
        innerPath = connectedTriBlob(CX, CY, dist, sR, neckR, alpha, baseAngle);
      } else if (p < 0.80) {
        // Stage 3 (00:01 of reference): Necks snap -> 3 detached circular photo droplets orbiting
        const k = (p - 0.55) / 0.25;
        const wave = Math.sin(k * Math.PI);
        dist = 62 + wave * 8;
        sR = 28 + wave * 2;
        const THIRD = (Math.PI * 2) / 3;
        const x0 = CX + Math.cos(baseAngle) * dist;
        const y0 = CY + Math.sin(baseAngle) * dist;
        const x1 = CX + Math.cos(baseAngle + THIRD) * dist;
        const y1 = CY + Math.sin(baseAngle + THIRD) * dist;
        const x2 = CX + Math.cos(baseAngle + THIRD * 2) * dist;
        const y2 = CY + Math.sin(baseAngle + THIRD * 2) * dist;
        innerPath =
          circleSubpath(x0, y0, sR) +
          ' ' +
          circleSubpath(x1, y1, sR) +
          ' ' +
          circleSubpath(x2, y2, sR);
      } else {
        // Stage 4 (00:02 of reference): 3 droplets rush inward, re-bridge, and coalesce into 1 sphere
        const k = (p - 0.80) / 0.20;
        const ease = k * k * (3 - 2 * k);
        dist = 62 * (1 - ease);
        sR = 28 + ease * 18;
        const neckR = 9 + ease * 39;
        const alpha = Math.PI * (0.72 - ease * 0.38);
        innerPath = connectedTriBlob(CX, CY, dist, sR, neckR, alpha, baseAngle);
      }

      const THIRD = (Math.PI * 2) / 3;
      b0x.value = CX + Math.cos(baseAngle) * dist;
      b0y.value = CY + Math.sin(baseAngle) * dist;
      b0r.value = sR;
      b1x.value = CX + Math.cos(baseAngle + THIRD) * dist;
      b1y.value = CY + Math.sin(baseAngle + THIRD) * dist;
      b1r.value = sR;
      b2x.value = CX + Math.cos(baseAngle + THIRD * 2) * dist;
      b2y.value = CY + Math.sin(baseAngle + THIRD * 2) * dist;
      b2r.value = sR;

      setPaths({
        cutout: `M 0 0 H ${STAGE} V ${STAGE} H 0 Z ${innerPath}`,
        outline: innerPath,
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
    };
  }, [b0r, b0x, b0y, b1r, b1x, b1y, b2r, b2x, b2y]);

  const stageStyle = useAnimatedStyle(() => ({
    opacity: stageOpacity.value,
    transform: [{ scale: stageScale.value }],
  }));

  const bulb0DiscStyle = useAnimatedStyle(() => {
    const r = b0r.value * 1.12;
    return {
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      transform: [{ translateX: b0x.value - r }, { translateY: b0y.value - r }],
    };
  });

  const bulb1DiscStyle = useAnimatedStyle(() => {
    const r = b1r.value * 1.12;
    return {
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      transform: [{ translateX: b1x.value - r }, { translateY: b1y.value - r }],
    };
  });

  const bulb2DiscStyle = useAnimatedStyle(() => {
    const r = b2r.value * 1.12;
    return {
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      transform: [{ translateX: b2x.value - r }, { translateY: b2y.value - r }],
    };
  });

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.bg,
        },
      ]}>
      <Animated.View
        style={[
          {
            width: STAGE,
            height: STAGE,
            overflow: 'hidden',
            backgroundColor: t.bg,
          },
          stageStyle,
        ]}>
        {/* Captured photograph layer + 3 orbiting photo discs underneath the cutout */}
        <View style={{ width: STAGE, height: STAGE, backgroundColor: t.text }}>
          <Image
            source={{ uri: photoUri }}
            resizeMode="cover"
            style={{ width: STAGE, height: STAGE }}
          />
          <Animated.View
            pointerEvents="none"
            style={[{ position: 'absolute', left: 0, top: 0, overflow: 'hidden' }, bulb0DiscStyle]}>
            <Image
              source={{ uri: photoUri }}
              resizeMode="cover"
              style={{ width: '100%', height: '100%', flex: 1 }}
            />
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[{ position: 'absolute', left: 0, top: 0, overflow: 'hidden' }, bulb1DiscStyle]}>
            <Image
              source={{ uri: photoUri }}
              resizeMode="cover"
              style={{ width: '100%', height: '100%', flex: 1 }}
            />
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[{ position: 'absolute', left: 0, top: 0, overflow: 'hidden' }, bulb2DiscStyle]}>
            <Image
              source={{ uri: photoUri }}
              resizeMode="cover"
              style={{ width: '100%', height: '100%', flex: 1 }}
            />
          </Animated.View>
        </View>

        {/* Inverted Even-Odd SVG Cutout Mask (paints t.bg everywhere outside the liquid blob) */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width={STAGE} height={STAGE} viewBox={`0 0 ${STAGE} ${STAGE}`}>
            <Path
              d={paths.cutout}
              fill={t.bg}
              fillRule="evenodd"
              clipRule="evenodd"
            />
            <Path
              d={paths.outline}
              fill="none"
              stroke={t.line}
              strokeWidth={1.5}
            />
          </Svg>
        </View>
      </Animated.View>

      {!coalescing && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{
            marginTop: 24,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 9,
            borderRadius: 999,
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.line,
          }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.accent }} />
          <Text
            accessibilityLiveRegion="polite"
            style={{
              color: t.text,
              fontFamily: 'Geist_500Medium',
              fontSize: 14,
              fontWeight: '500',
            }}>
            Identificando objeto con IA…
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
