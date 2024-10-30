/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      container: {
        center: true,
      },
      fontFamily: {
        neuropolitical: ['Neuropolitical'],
        teko: ['Teko'],
        paji: ['"Baloo Paaji 2"'],
      },
      colors: {
        // Custom black and white shades
        darkBg1: '#000000',  // Very dark background (almost black)
        darkBg2: '#080808',  // Slightly lighter, but still very dark
        darkBg3: '#131313',  // Another close-to-black background color
        darkBg4: '#232323',  // Another close-to-black background color

        // Updated text colors spread out in brightness
        textPrimary: '#FFFFFF',  // Pure White for main text
        textSecondary: '#E5E5E5',  // Soft White for secondary text
        textTert: '#B3B3B3',  // Light Gray for tertiary/less important text

        // Button color
        buttonBlack: '#000000',  // Completely black for buttons
      },
      boxShadow: {
        'all-around': `inset 0 0 0.5px 1px hsla(0, 0%,  100%, 0.3), 
          /* shadow ring 👇 */
          0 0 0 1px hsla(0, 0%, 0%, 0.05),
          /* multiple soft shadows 👇 */
          0 0.3px 0.4px hsla(0, 0%, 0%, 0.02),
          0 0.9px 1.5px hsla(0, 0%, 0%, 0.045),
          0 3.5px 6px hsla(0, 0%, 0%, 0.09) ;`,
      },

    },
  },
  plugins: [],
}
