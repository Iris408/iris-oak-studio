/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // The header builds its translucent background at runtime so these classes never appear literally in the source.
  safelist: ['bg-zinc-950/80', 'bg-stone-100/80', 'bg-slate-950/80', 'bg-[#FAF8F5]/80'],
  theme: {
    extend: {
      fontFamily: {
        dyslexic: ['OpenDyslexic', 'sans-serif'],
      },
      // Used by the project modal and configurator drawer (`animate-fade-in`).
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'orbit-travel': {
          from: { 'offset-distance': '0%' },
          to: { 'offset-distance': '100%' },
        },
        'orbit-glow': {
          from: { opacity: '0.14' },
          to: { opacity: '0.24' },
        },
        // Engineering process connectors: a dot travelling along the line (2rem = connector length)
        'connector-pulse-x': {
          '0%': { transform: 'translateX(0)', opacity: '0' },
          '20%, 80%': { opacity: '0.8' },
          '100%': { transform: 'translateX(2rem)', opacity: '0' },
        },
        'connector-pulse-y': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '20%, 80%': { opacity: '0.8' },
          '100%': { transform: 'translateY(2rem)', opacity: '0' },
        },
        // Connector chevron glows as the pulse passes behind it (same 4s cycle)
        'connector-glow': {
          '0%, 30%, 70%, 100%': { boxShadow: '0 0 0 0 transparent' },
          '50%': { boxShadow: '0 0 8px 0 currentColor' },
        },
        // Site Check-up → next section: a ring that expands and fades
        'transition-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '70%, 100%': { transform: 'scale(2.6)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        // Decorative hero orbit layer.
        'orbit-travel': 'orbit-travel 60s linear infinite',
        'orbit-glow': 'orbit-glow 8s ease-in-out infinite alternate',
        'connector-pulse-x': 'connector-pulse-x 4s ease-in-out infinite',
        'connector-pulse-y': 'connector-pulse-y 4s ease-in-out infinite',
        'connector-glow': 'connector-glow 4s ease-in-out infinite',
        'transition-ring': 'transition-ring 5s ease-out infinite',
      },
    },
  },
  plugins: [],
};
