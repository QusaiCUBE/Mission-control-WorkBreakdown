/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bg-primary': '#0F1117',
        'bg-secondary': '#1A1D27',
        'bg-tertiary': '#242836',
        'border-primary': '#2D3348',
        'christian': '#3B82F6',
        'qusai': '#F43F5E',
        'status-progress': '#F39C12',
        'status-review': '#6C5CE7',
        'status-done': '#00B894',
        'status-overdue': '#D63031',
      },
    },
  },
  plugins: [],
};
