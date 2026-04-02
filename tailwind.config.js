/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        tokyo: {
          bg:      "#1a1b2e",
          surface: "#16213e",
          panel:   "#0f3460",
          border:  "#1f2b47",
          accent:  "#e94560",
          cyan:    "#7dcfff",
          purple:  "#bb9af7",
          green:   "#9ece6a",
          yellow:  "#e0af68",
          orange:  "#ff9e64",
          text:    "#c0caf5",
          muted:   "#565f89",
          faint:   "#2a2f4a",
        },
      },
      animation: {
        "ping-slow": "ping-slow 2.5s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in":   "fade-in 0.4s ease forwards",
        "slide-up":  "slide-up 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
      },
      keyframes: {
        "ping-slow": {
          "0%":   { transform: "scale(0.9)", opacity: "0.6" },
          "70%":  { transform: "scale(1.3)", opacity: "0" },
          "100%": { transform: "scale(1.3)", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
