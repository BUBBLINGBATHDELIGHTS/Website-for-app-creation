/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        cream: '#FAF7F2',
        lavender: '#B8A8EA',
        mint: '#7FB9A7',
        charcoal: '#232323'
      }
    }
  },
  plugins: []
};
