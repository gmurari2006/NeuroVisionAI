import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clinical Medical Software Color Palette
        med: {
          bg: "var(--med-bg)",
          card: "var(--med-card)",
          primary: "var(--med-primary)",
          "primary-hover": "var(--med-primary-hover)",
          navy: "var(--med-navy)",
          teal: "var(--med-teal)",
          "teal-hover": "var(--med-teal-hover)",
          text: "var(--med-text)",
          muted: "var(--med-muted)",
          border: "var(--med-border)",
          "border-subtle": "var(--med-border-subtle)",
          success: "var(--med-success)",
          "warn-bg": "var(--med-warn-bg)",
          "warn-text": "var(--med-warn-text)",
          "warn-border": "var(--med-warn-border)",
          header: "var(--med-header-bg)",
          hover: "var(--med-hover-bg)",
        },
        // Legacy aliases mapped directly to medical variables
        ws: {
          bg: "var(--med-bg)",
          card: "var(--med-card)",
          sidebar: "var(--med-card)",
          border: "var(--med-border)",
          "border-subtle": "var(--med-border-subtle)",
          text: "var(--med-text)",
          muted: "var(--med-muted)",
          action: "var(--med-primary)",
          "action-hover": "var(--med-primary-hover)",
          accent: "var(--med-teal)",
          "accent-hover": "var(--med-teal-hover)",
          header: "var(--med-header-bg)",
          hover: "var(--med-hover-bg)",
        },
        // Direct medical brand tokens
        clinical: {
          bg: "#F7F9FC",
          card: "#FFFFFF",
          blue: "#1769AA",
          navy: "#16324F",
          teal: "#159D91",
          text: "#243447",
          muted: "#64748B",
          border: "#DCE5EF",
          success: "#15803D",
          warnBg: "#FFF7E6",
          warnText: "#92400E",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        med: "8px",
        "med-sm": "6px",
        "med-lg": "12px",
        ws: "8px",
        "ws-sm": "6px",
        "ws-lg": "12px",
      },
      boxShadow: {
        med: "0 1px 3px 0 rgba(22, 50, 79, 0.05), 0 1px 2px 0 rgba(22, 50, 79, 0.03)",
        "med-md": "0 4px 6px -1px rgba(22, 50, 79, 0.07), 0 2px 4px -1px rgba(22, 50, 79, 0.04)",
        ws: "0 1px 3px 0 rgba(22, 50, 79, 0.05), 0 1px 2px 0 rgba(22, 50, 79, 0.03)",
        "ws-md": "0 4px 6px -1px rgba(22, 50, 79, 0.07), 0 2px 4px -1px rgba(22, 50, 79, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
