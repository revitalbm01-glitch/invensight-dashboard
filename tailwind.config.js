/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Assistant', 'Heebo', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        status: {
          good: '#16a34a',
          goodBg: '#f0fdf4',
          warn: '#d97706',
          warnBg: '#fffbeb',
          bad: '#dc2626',
          badBg: '#fef2f2',
          info: '#2563eb',
          infoBg: '#eff6ff',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.03)',
        cardHover: '0 12px 24px -8px rgba(15, 23, 42, 0.16), 0 4px 8px -4px rgba(15, 23, 42, 0.08)',
        elevated: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 8px 24px -6px rgba(15, 23, 42, 0.08)',
        nav: 'inset -1px 0 0 0 rgba(255,255,255,0.04)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #1e3a8a 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #0f172a 0%, #0b1120 100%)',
      },
    },
  },
  plugins: [],
}
