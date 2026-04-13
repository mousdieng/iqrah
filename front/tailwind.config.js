/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        quranic: {
          gold: '#D4AF37',
          green: '#2D5016',
          darkGreen: '#1a2e0d',
          cream: '#F5F5DC',
        }
      },
      fontFamily: {
        arabic: ['Amiri', 'serif'],
        quran: ['Scheherazade New', 'Amiri', 'serif'],
      },
    },
  },
  plugins: [],
}
