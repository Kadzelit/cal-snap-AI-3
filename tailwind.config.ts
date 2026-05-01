import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fcf9f8",
        foreground: "#1c1b1b",
        primary: {
          DEFAULT: "#006e2a",
          container: "#00c853",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#8c5000",
          container: "#fe9400",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f0eded",
          foreground: "#6c7b6a",
        },
        surface: {
          DEFAULT: "#fcf9f8",
          dim: "#dcd9d9",
          low: "#f6f3f2",
          container: "#f0eded",
          high: "#eae7e7",
          highest: "#e5e2e1",
        },
        border: "#bbcbb8",
        outline: "#6c7b6a",
        card: {
          DEFAULT: "#f0eded",
          foreground: "#1c1b1b",
        },
        destructive: {
          DEFAULT: "#ba1a1a",
          foreground: "#ffffff",
        },
        ring: "#006e2a",
        input: "#e5e2e1",
        popover: {
          DEFAULT: "#fcf9f8",
          foreground: "#1c1b1b",
        },
        accent: {
          DEFAULT: "#fe9400",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.75rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "20px",
        "3xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        card: "0px 4px 20px rgba(26, 26, 26, 0.04)",
        "card-hover": "0px 8px 30px rgba(26, 26, 26, 0.08)",
      },
      fontSize: {
        "display-xl": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "heading-lg": ["28px", { lineHeight: "1.2" }],
        "heading-md": ["20px", { lineHeight: "1.3" }],
        "body-lg": ["18px", { lineHeight: "1.6" }],
        "body-md": ["16px", { lineHeight: "1.5" }],
        "metric-large": ["40px", { lineHeight: "1.0" }],
        "label-caps": ["12px", { lineHeight: "1.0", letterSpacing: "0.05em" }],
      },
    },
  },
  plugins: [],
};
export default config;
