import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        canvas: "var(--canvas)",
        paper: "var(--paper)",
        brand: {
          DEFAULT: "var(--brand)",
          deep: "var(--brand-deep)",
        },
        accent: "var(--accent)",
        line: "var(--line)",
        muted: "var(--muted)",
        danger: {
          DEFAULT: "var(--danger)",
          deep: "var(--danger-deep)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "16px",
        soft: "14px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 32, 28, 0.04), 0 8px 24px rgba(20, 32, 28, 0.06)",
      },
      maxWidth: {
        page: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;
