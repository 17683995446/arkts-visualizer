/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        space: {
          950: "#0A0F1C",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
        },
        neon: {
          cyan: "#00E5FF",
          purple: "#9D4EDD",
          pink: "#FF006E",
          green: "#39FF14",
        },
        glass: {
          bg: "rgba(255, 255, 255, 0.03)",
          border: "rgba(255, 255, 255, 0.08)",
        }
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'grid-move': 'grid-move 20s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { 'box-shadow': '0 0 10px rgba(0, 229, 255, 0.3), 0 0 20px rgba(157, 78, 221, 0.2)' },
          '50%': { 'box-shadow': '0 0 20px rgba(0, 229, 255, 0.6), 0 0 40px rgba(157, 78, 221, 0.4)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'grid-move': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
      },
    },
  },
  plugins: [],
};
