/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#1a1a2e',
        card: '#16213e',
        border: '#0f3460',
        accent: '#e94560',
        income: '#4ade80',
        expense: '#f87171',
        transfer: '#60a5fa',
      },
    },
  },
  plugins: [],
}

