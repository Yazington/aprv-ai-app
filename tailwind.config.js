/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        neuropolitical: ['Neuropolitical'],
        teko: ['Teko'],
        paji: ['"Baloo Paaji 2"']
      },
    },
  },
  plugins: [],
}
