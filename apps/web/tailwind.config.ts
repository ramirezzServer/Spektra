import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          secondary: '#F8F9FB',
          tertiary: '#EEF1F6',
        },
        surface: '#FCFCFD',
        border: '#E3E6ED',
        content: {
          primary: '#0F1117',
          secondary: '#667085',
          tertiary: '#98A2B3',
        },
        accent: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF',
          text: '#FFFFFF',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
          text: '#991B1B',
        },
        app: {
          bg: '#F8F9FB',
          text: '#0F1117',
          accent: '#4F46E5',
          border: '#E3E6ED',
          surface: '#FCFCFD',
          muted: '#667085',
        },
      },
      fontFamily: {
        sans: ['Instrument Sans', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 17, 23, 0.06)',
        card: '0 10px 30px rgba(15, 17, 23, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config;
