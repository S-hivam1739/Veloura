/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        veloura: {
          dark: '#121212',
          charcoal: '#1E1E1E',
          gold: '#C5A880',
          'gold-light': '#E5D5C0',
          'gold-dark': '#9A7B56',
          sand: '#F4F1EA',
          cream: '#FAF9F6',
          muted: '#71717A',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
