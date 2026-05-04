/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#F7F4EC',
        'bg-section': '#EAF2F5',
        'bg-card': '#FFFDF8',
        'text-primary': '#102A43',
        'text-muted': '#64748B',
        'warming': '#D95D39',
        'warming-deep': '#A63A2D',
        'ocean': '#3A86A8',
        'ice': '#A7DDE8',
        'natural': '#A8AEB8',
        'amber-hl': '#F4B860',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'draw': 'draw 2s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
