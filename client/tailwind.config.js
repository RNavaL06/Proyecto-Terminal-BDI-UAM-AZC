/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#497dfe',
          'blue-dark': '#3b6aec',
          'blue-light': '#eff6ff',
          rose: '#fb7185',
          'rose-dark': '#f43f5e',
          'rose-light': '#fff1f2',
        },
        medical: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#497dfe',
          600: '#3b6aec',
          700: '#2563eb',
          800: '#1d4ed8',
          900: '#1e40af',
        },
      },
    },
  },
  plugins: [],
}
