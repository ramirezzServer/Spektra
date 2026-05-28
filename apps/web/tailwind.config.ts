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
        border: {
          DEFAULT: '#E3E6ED',
          strong: '#C9CED8',
        },
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
        warning: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
          text: '#92400E',
        },
        success: {
          DEFAULT: '#059669',
          light: '#ECFDF5',
          text: '#065F46',
        },
        film: {
          light: '#EEF2FF',
          text: '#3730A3',
        },
        series: {
          light: '#ECFEFF',
          text: '#0E7490',
        },
        game: {
          light: '#F0FDF4',
          text: '#15803D',
        },
        book: {
          light: '#FFF7ED',
          text: '#C2410C',
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
        modal: '0 24px 70px rgba(15, 17, 23, 0.18)',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
