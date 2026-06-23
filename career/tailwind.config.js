/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // This is your default body font
        sans: ['DM Sans', 'sans-serif'],
        
        // --- ADD THIS LINE ---
        // This creates a new 'font-title' utility class
        title: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
