/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'via-emerald-400/80', 'to-cyan-400/80',
    'via-blue-400/80', 'to-blue-400/80',
    'via-cyan-400/80', 'to-cyan-400/80',
    'via-fuchsia-400/80', 'to-fuchsia-400/80',
    'text-emerald-400', 'text-blue-400', 'text-cyan-400', 'text-fuchsia-400'
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Charcoal Black
        foreground: '#fafafa', // Warm White
        primary: '#10b981', // Emerald Green
        secondary: '#0ea5e9', // Ocean Blue
        indigo: '#6366f1', // Soft Indigo
        accent: '#f59e0b', // Golden Amber
        orange: '#f97316', // Sunset Orange
        purple: '#a855f7', // Soft Purple
        muted: '#18181b', // Darker gray for sidebar
        'muted-foreground': '#a1a1aa',
        border: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(to bottom right, rgba(24, 24, 27, 0.8), rgba(9, 9, 11, 0.9))',
      },
      animation: {
        gradient: 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      }
    },
  },
  plugins: [],
}
