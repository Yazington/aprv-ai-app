/** @type {import('tailwindcss').Config} */
export default {
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
        // Dark mode - 2025 sophisticated theme
        darkBg1: '#0f172a',  // Deep navy - Main background
        darkBg2: '#1e293b',  // Rich slate - Surface
        darkBg3: '#334155',  // Mocha mousse - UI elements
        darkBg4: '#475569',  // Deep slate - Borders

        // Light mode - 2025 natural, warm theme
        lightBg1: '#faf5f0',  // Warm white - Main background
        lightBg2: '#f3f4f6',  // Soft gray - Surface
        lightBg3: '#e5e7eb',  // Natural gray - UI elements
        lightBg4: '#d1d5db',  // Muted gray - Borders

        // Accent colors - 2025 trends
        accent1: '#818cf8',    // Modern indigo - Primary
        accent2: '#f472b6',    // Dusty rose - Secondary
        accent3: '#fbbf24',    // Warm yellow - Tertiary (True Joy inspired)
        accent4: '#34d399',    // Fresh sage - Success

        // Text colors - Refined for 2025
        textPrimary: 'var(--color-text-primary)',
        textSecondary: 'var(--color-text-secondary)',
        textTert: 'var(--color-text-tertiary)',
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
      keyframes: {
        tilt: {
          '0%, 50%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(0.5deg)',
          },
          '75%': {
            transform: 'rotate(-0.5deg)',
          },
        },
      },
      animation: {
        tilt: 'tilt 10s infinite linear',
      },
    },
  },
}
