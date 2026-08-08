import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFF8F1",
        surface: "#FFFFFF",
        mascot: "#FF8A42",
        coral: "#FF6B8B",
        lemon: "#FFC93C",
        mint: "#7ED9A7",
        sky: "#54C0EB",
        lavender: "#9B8BEB",
        ink: "#3A3A55",
        soft: "#B9B9CE",
      },
      fontFamily: {
        rounded: ["var(--font-rounded)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 6px 0 rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.08)",
        press: "0 3px 0 rgba(0,0,0,0.06), 0 6px 12px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      minHeight: {
        tap: "44px",
      },
    },
  },
  plugins: [],
};

export default config;