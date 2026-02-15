/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2F7FFB',
          dark: '#1E5FC7',
          light: '#4A90E2',
        },
        text: {
          primary: '#333333',
          secondary: '#6C757D',
          light: '#9CA3AF',
        },
        border: {
          DEFAULT: '#CED4DA',
          light: '#E5E7EB',
        },
        background: {
          DEFAULT: '#FFFFFF',
          light: '#F8F9FA',
          grey: '#F3F4F6',
        },
        priority: {
          high: '#F97316',
          medium: '#F59E0B',
          low: '#10B981',
        },
        status: {
          open: '#2F7FFB',
          inProgress: '#8B5CF6',
          completed: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}



