/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // One fine neutral scale, near-white to near-black.
        ink: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E8E8EA',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#17171A',
          950: '#0A0A0B',
        },
        // The single accent. Used on only four things: scan lock, primary
        // action, the unsaved dot, and the audio-playing state.
        accent: {
          DEFAULT: '#2F6BFF',
          soft: '#E6EDFF',
          deep: '#1F4FD6',
        },
        danger: '#D92D20',
      },
      fontFamily: {
        display: ['Geist_600SemiBold'],
        'display-medium': ['Geist_500Medium'],
      },
      fontSize: {
        word: ['56px', { lineHeight: '58px', letterSpacing: '-1.6px' }],
        title: ['30px', { lineHeight: '34px', letterSpacing: '-0.6px' }],
        headline: ['17px', { lineHeight: '22px' }],
        body: ['16px', { lineHeight: '23px' }],
        caption: ['13px', { lineHeight: '17px' }],
      },
      borderRadius: {
        card: '20px',
      },
    },
  },
  plugins: [],
};
