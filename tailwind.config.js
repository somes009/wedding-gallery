/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'kenburns-slow-zoom-in': 'kenburns-slow-zoom-in 20s ease-in-out infinite alternate',
        'kenburns-slow-zoom-out': 'kenburns-slow-zoom-out 20s ease-in-out infinite alternate',
        'kenburns-slow-pan-left': 'kenburns-slow-pan-left 25s ease-in-out infinite alternate',
        'kenburns-slow-pan-right': 'kenburns-slow-pan-right 25s ease-in-out infinite alternate',
        'fade-in-slow': 'fade-in 1.5s ease-out forwards',
      },
      keyframes: {
        'kenburns-slow-zoom-in': {
          '0%': { transform: 'scale(1.0) translate(0, 0)' },
          '100%': { transform: 'scale(1.15) translate(-1%, -1%)' }
        },
        'kenburns-slow-zoom-out': {
          '0%': { transform: 'scale(1.15) translate(1%, 1%)' },
          '100%': { transform: 'scale(1.0) translate(0, 0)' }
        },
        'kenburns-slow-pan-left': {
          '0%': { transform: 'scale(1.1) translate(2%, 0)' },
          '100%': { transform: 'scale(1.1) translate(-2%, 0)' }
        },
        'kenburns-slow-pan-right': {
          '0%': { transform: 'scale(1.1) translate(-2%, 0)' },
          '100%': { transform: 'scale(1.1) translate(2%, 0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}