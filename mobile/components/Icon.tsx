import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'x'
  | 'check'
  | 'flash'
  | 'flash-off'
  | 'flip'
  | 'image'
  | 'volume'
  | 'trash'
  | 'chevron-down'
  | 'arrow-right'
  | 'camera'
  | 'grid'
  | 'user';

interface Props {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

/** One authored icon set: 24px grid, 1.75 stroke, round caps. */
export function Icon({ name, size = 22, color, strokeWidth = 1.75 }: Props) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'x' && (
        <>
          <Path d="M18 6 6 18" {...common} />
          <Path d="m6 6 12 12" {...common} />
        </>
      )}
      {name === 'check' && <Path d="M20 6 9 17l-5-5" {...common} />}
      {(name === 'flash' || name === 'flash-off') && (
        <>
          <Path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" {...common} />
          {name === 'flash-off' && <Path d="M3 3l18 18" {...common} />}
        </>
      )}
      {name === 'flip' && (
        <>
          <Path d="M3 12a9 9 0 0 1 15-6.7L21 8" {...common} />
          <Path d="M21 3v5h-5" {...common} />
          <Path d="M21 12a9 9 0 0 1-15 6.7L3 16" {...common} />
          <Path d="M8 16H3v5" {...common} />
        </>
      )}
      {name === 'image' && (
        <>
          <Rect x={3} y={3} width={18} height={18} rx={3} {...common} />
          <Circle cx={9} cy={9} r={2} {...common} />
          <Path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" {...common} />
        </>
      )}
      {name === 'volume' && (
        <>
          <Path d="M11 5 6 9H2v6h4l5 4V5z" {...common} />
          <Path d="M15.5 8.5a5 5 0 0 1 0 7" {...common} />
          <Path d="M19 5a10 10 0 0 1 0 14" {...common} />
        </>
      )}
      {name === 'trash' && (
        <>
          <Path d="M3 6h18" {...common} />
          <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" {...common} />
          <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" {...common} />
        </>
      )}
      {name === 'chevron-down' && <Path d="m6 9 6 6 6-6" {...common} />}
      {name === 'arrow-right' && (
        <>
          <Path d="M5 12h14" {...common} />
          <Path d="m12 5 7 7-7 7" {...common} />
        </>
      )}
      {name === 'camera' && (
        <>
          <Path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" {...common} />
          <Circle cx={12} cy={13} r={3.5} {...common} />
        </>
      )}
      {name === 'grid' && (
        <>
          <Rect x={3} y={3} width={7.5} height={7.5} rx={2} {...common} />
          <Rect x={13.5} y={3} width={7.5} height={7.5} rx={2} {...common} />
          <Rect x={3} y={13.5} width={7.5} height={7.5} rx={2} {...common} />
          <Rect x={13.5} y={13.5} width={7.5} height={7.5} rx={2} {...common} />
        </>
      )}
      {name === 'user' && (
        <>
          <Circle cx={12} cy={8} r={4} {...common} />
          <Path d="M20 21a8 8 0 0 0-16 0" {...common} />
        </>
      )}
    </Svg>
  );
}
