/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noche: '#061225',
        space: '#0b1f3a',
        tierra: '#b96b45',
        hoja: '#5cc9a7',
        sol: '#f3c969',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        sensor: '0 0 0 1px rgba(255,255,255,.08), 0 18px 60px rgba(0,0,0,.35)',
      },
    },
  },
  plugins: [],
}
