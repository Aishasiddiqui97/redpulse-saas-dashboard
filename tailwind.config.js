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
        darkBg: {
          primary: '#0A0A0F',     // Rich Black
          secondary: '#161B22',   // Charcoal Gray
        },
        accent: {
          primary: '#7C3AED',     // Electric Purple
          secondary: '#00E5FF',   // Neon Cyan
          highlight: '#FF6B6B',   // Coral Red
        },
        softWhite: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        glassAccent: '0 8px 32px 0 rgba(124, 58, 237, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
