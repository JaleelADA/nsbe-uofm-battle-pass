/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        nsbeGreen: "#4CAF50",
        nsbeGold: "#FFD700",
        nsbeBlue: "#2196F3",
        darkBg: "#0D1117",
        neonGlow: "#00FFAB",
      },
      fontFamily: {
        futuristic: ["Orbitron", "sans-serif"],
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%, 100%": { textShadow: "0 0 5px #00FFAB, 0 0 10px #00FFAB" },
          "50%": { textShadow: "0 0 20px #00FFAB, 0 0 30px #00FFAB" },
        },
      },
    },
  },
  plugins: [],
}
