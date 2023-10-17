/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#fff3eb',
          200: '#f6e1d4',
          300: '#e1bca5',
          400: '#d29f7e',
          500: '#af7550',
          600: '#9e5f37',
          700: '#87451b',
          800: '#662e0a',
          900: '#361602'
        },
        dimWhite: '#666666',
        background: '#f4f4f4'
      }
    },
  },
  plugins: [],
}
