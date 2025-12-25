/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Palette - "High-End Cyber-Institutional"
        background: '#070709',
        terminal: '#0a0a0c',
        card: '#0f0f12',
        surface: '#141418',

        // Accent Colors
        accent: '#dc2626', // Neon Red - Primary
        'accent-dim': 'rgba(220, 38, 38, 0.1)',
        'accent-glow': 'rgba(220, 38, 38, 0.3)',

        // Signal Colors
        signal: {
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#3b82f6',
          purple: '#a855f7',
        },

        // Tier Colors
        tier: {
          major: '#dc2626',
          indie: '#22c55e',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'marquee': 'marquee 20s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { opacity: 0.5 },
          '100%': { opacity: 1 },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.3)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
      }
    },
  },
  plugins: [],
}
