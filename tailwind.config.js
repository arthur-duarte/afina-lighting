/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        // Afina brand colors
        afina: {
          50:  '#fef3f2',
          100: '#fee4e1',
          200: '#fecdc7',
          300: '#fca89f',
          400: '#f87464',
          500: '#ef4732',
          600: '#dd2e1a',
          700: '#b92213',
          800: '#991f14',
          900: '#7e2018',
          950: '#440c08',
        },
        // Backstage (red night mode)
        backstage: {
          bg:      '#0a0000',
          surface: '#1a0000',
          border:  '#3d0000',
          accent:  '#cc0000',
          text:    '#ff3333',
          dim:     '#661111',
        },
        // Editor surfaces
        editor: {
          bg:      '#0f0f13',
          surface: '#18181f',
          raised:  '#1f1f2a',
          border:  '#2a2a38',
          hover:   '#252532',
          active:  '#2e2e40',
        },
      },
      boxShadow: {
        'panel': '0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
        'glow-red': '0 0 12px rgba(204,0,0,0.3)',
        'glow-amber': '0 0 12px rgba(251,146,60,0.3)',
        'glow-blue': '0 0 12px rgba(96,165,250,0.3)',
      },
      animation: {
        'pulse-conflict': 'conflict-pulse 0.8s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-left': 'slide-in-left 0.25s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
      },
      keyframes: {
        'conflict-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
