/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: { 50:'#fdf9f0', 100:'#faf4e8', 200:'#f5ecd9', 300:'#ecdfbf', 400:'#dfc89a' },
        forest: { 500:'#3d5d54', 600:'#2d4a3e', 700:'#1f3329' },
        gold: { 400:'#d4a574', 500:'#c4924a', 600:'#a87838' },
        wine: { 500:'#8c4a5e', 600:'#6e3848' },
        ink: { 700:'#3d3327', 800:'#2d2618', 900:'#1a1610' },
      },
    },
  },
  plugins: [],
}
