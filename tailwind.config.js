/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // The header builds its translucent background at runtime (`${activeTheme.bg}/80`),
  // so these classes never appear literally in the source.
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
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        // Decorative hero orbit layer.
        'orbit-travel': 'orbit-travel 60s linear infinite',
        'orbit-glow': 'orbit-glow 8s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
};
