/** @type {import("tailwindcss").Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep blue-black base (page gradient endpoints)
        bg: "#0a0e1c",
        "bg-deep": "#05070f",
        // Frosted glass surfaces — translucent white over the gradient.
        surface: "rgba(255,255,255,0.045)",
        "surface-2": "rgba(255,255,255,0.07)",
        "surface-3": "rgba(255,255,255,0.11)",
        border: "rgba(255,255,255,0.10)",
        muted: "#8b93a8",
        fg: "#eaf0ff",
        // Indigo brand accent
        brand: {
          DEFAULT: "#6e7bf2",
          fg: "#05070f",
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
      boxShadow: {
        glow: "0 0 28px -4px rgba(110,123,242,0.45)",
        "glow-sm": "0 0 16px -4px rgba(110,123,242,0.4)",
        glass: "0 8px 32px -8px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      backdropBlur: {
        xs: "2px",
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
