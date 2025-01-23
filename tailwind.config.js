/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  plugins: [
    require('tailwindcss-safe-area'),
  ],
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
        moveBackground: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '3em 3em' }
        },
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
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        "zoom-in": {
          from: { transform: "scale(0.95)" },
          to: { transform: "scale(1)" },
        },
        "zoom-out": {
          from: { transform: "scale(1)" },
          to: { transform: "scale(0.95)" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        slideDown: {
          from: { height: 0, opacity: 0 },
          to: { height: "var(--radix-collapsible-content-height)", opacity: 1 },
        },
        slideUp: {
          from: { height: "var(--radix-collapsible-content-height)", opacity: 1 },
          to: { height: 0, opacity: 0 },
        },
      },
      animation: {
        tilt: 'tilt 10s infinite linear',
        networkBg: 'moveBackground 20s linear infinite',
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-in",
        "zoom-in": "zoom-in 0.2s ease-out",
        "zoom-out": "zoom-out 0.2s ease-in",
        "slide-in-from-top": "slide-in-from-top 0.2s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.2s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.2s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.2s ease-out",
        "slideDown": "slideDown 0.3s ease-out",
        "slideUp": "slideUp 0.3s ease-out",
      },
    },
  },
  variants: {
    extend: {
      display: ['group-hover'],
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-none': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.pb-safe': {
          'padding-bottom': 'env(safe-area-inset-bottom)'
        },
        '.pt-safe': {
          'padding-top': 'env(safe-area-inset-top)'
        },
        '.touch-callout-none': {
          '-webkit-touch-callout': 'none'
        }
      })
    }
  ]
}
