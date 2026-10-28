import { useColorScheme } from 'react-native';

export const ACCENT = '#2F6BFF';

const light = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F4F5',
  line: '#E8E8EA',
  text: '#0A0A0B',
  textMuted: '#71717A',
  textSubtle: '#A1A1AA',
  accent: ACCENT,
  onAccent: '#FFFFFF',
  danger: '#D92D20',
};

const dark: typeof light = {
  bg: '#0A0A0B',
  surface: '#141417',
  surfaceMuted: '#17171A',
  line: '#27272A',
  text: '#FAFAFA',
  textMuted: '#A1A1AA',
  textSubtle: '#71717A',
  accent: ACCENT,
  onAccent: '#FFFFFF',
  danger: '#F97066',
};

export type Theme = typeof light;

export function useTheme(): Theme & { scheme: 'light' | 'dark' } {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { ...(scheme === 'dark' ? dark : light), scheme };
}

/** Exponential ease-out control points, used for every authored move. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
