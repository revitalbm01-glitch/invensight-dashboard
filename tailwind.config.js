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
        // Decorative KPI/donut palette — rotates for visual variety on cards
        // and chart slices. `danger` is reserved exclusively for breach
        // indication and must never appear in the rotation.
        kpi: {
          teal: '#3d8f8c',
          tealLight: '#4fc3bf',
          orange: '#c9791f',
          orangeLight: '#f0ad66',
          purple: '#7d3f9e',
          purpleLight: '#b579cc',
          blue: '#3f5fc4',
          blueLight: '#6a8bf0',
          rose: '#c23f6b',
          roseLight: '#ec7a9c',
          danger: '#c73530',
          dangerLight: '#f0625f',
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
        'kpi-teal': 'linear-gradient(135deg, #4fc3bf 0%, #2f7d7a 100%)',
        'kpi-orange': 'linear-gradient(135deg, #f0ad66 0%, #c9761d 100%)',
        'kpi-purple': 'linear-gradient(135deg, #b579cc 0%, #7d3f9e 100%)',
        'kpi-blue': 'linear-gradient(135deg, #6a8bf0 0%, #3651b0 100%)',
        'kpi-danger': 'linear-gradient(135deg, #f0625f 0%, #b52a26 100%)',
      },
    },
  },
  plugins: [],
}
