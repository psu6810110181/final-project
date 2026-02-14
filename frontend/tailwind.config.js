/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          600: '#EA580C',
          700: '#C2410C',
        }
      }
    },
  },
  plugins: [],
}