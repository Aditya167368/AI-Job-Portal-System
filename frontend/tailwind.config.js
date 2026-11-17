/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#090d16',
          900: '#0f172a',
          850: '#151f38',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        leetcode: {
          easy: '#00b8a3',
          medium: '#ffc01e',
          hard: '#ff375f',
          accent: '#ffa116',
          darkBg: '#1a1a1a',
          panel: '#262626',
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
