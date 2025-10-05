import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fef7f9',
          100: '#fdeef4',
          200: '#fad5e4',
          300: '#f6b0cb',
          400: '#ee82ac',
          500: '#d9528b',
          600: '#b63772',
          700: '#8f2859',
          800: '#661b3f',
          900: '#401026',
        },
        eucalyptus: {
          50: '#f1fbf6',
          100: '#dff6ea',
          200: '#b7ebce',
          300: '#89dcae',
          400: '#5ccb8e',
          500: '#39b072',
          600: '#288b59',
          700: '#1f6944',
          800: '#154531',
          900: '#0b261d',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', ...fontFamily.serif],
        sans: ['"Inter"', ...fontFamily.sans],
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 0px rgba(137, 220, 174, 0)' },
          '50%': { boxShadow: '0 0 40px rgba(137, 220, 174, 0.4)' },
        },
      },
      animation: {
        glow: 'glow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
