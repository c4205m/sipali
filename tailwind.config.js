/** @type {import("tailwindcss").Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surface scale (dark-first)
        bg: "#0b0d10",
        surface: "#14171c",
        "surface-2": "#1b1f26",
        "surface-3": "#242935",
        border: "#2a2f3a",
        muted: "#8a92a3",
        fg: "#e7eaf0",
        // Brand
        brand: {
          DEFAULT: "#7c8cff",
          fg: "#0b0d10",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};
