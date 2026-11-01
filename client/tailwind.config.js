/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cobalt: {
          DEFAULT: '#1649E8',
          hover: '#133fc7',
          dark: '#092B9B',
        },
        navy: {
          DEFAULT: '#092B9B',
          deep: '#061c6b',
        },
        electric: {
          DEFAULT: '#245BFF',
          light: '#4d78ff',
        },
        neon: {
          lime: '#A6FF00',
          hover: '#95e600',
          dark: '#76b800',
        },
        softBg: '#F5F7FC',
        darkBg: '#050B1E',
        darkSurface: '#0B1533',
        darkText: '#111827',
        mutedText: '#737B8C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(16, 38, 120, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(22, 73, 232, 0.14)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-dark-hover': '0 12px 40px 0 rgba(36, 91, 255, 0.25)',
        'glow-lime': '0 0 24px -2px rgba(166, 255, 0, 0.45)',
        'glow-blue': '0 0 28px -4px rgba(36, 91, 255, 0.35)',
        'liquid-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.25)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '16px',
        'glass-heavy': '24px',
      },
    },
  },
  plugins: [],
}
