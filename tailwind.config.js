/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#10b981', // Emerald 500
          DEFAULT: '#059669', // Emerald 600
          dark: '#064e3b', // Emerald 900
        },
        accent: {
          success: '#10b981', // Green
          danger: '#ef4444', // Red
          warning: '#f59e0b', // Yellow
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
