import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
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
      },
    },
  },
  plugins: [],
} satisfies Config;
