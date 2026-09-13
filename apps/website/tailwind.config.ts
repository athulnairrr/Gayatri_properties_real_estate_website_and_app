import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f7f5",
          100: "#e4ebe6",
          200: "#c8d6cc",
          300: "#a2b9a9",
          400: "#77967f",
          500: "#587a62",
          600: "#44614d",
          700: "#374e3f",
          800: "#2d4034",
          900: "#26352c",
          950: "#131d17",
        },
        sand: {
          50: "#faf8f4",
          100: "#f3ede2",
          200: "#e6d9c2",
          300: "#d5be97",
          400: "#c3a06d",
          500: "#b3894f",
          600: "#a37343",
          700: "#875c39",
          800: "#6e4b33",
          900: "#5a3e2c",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        serif: ["Georgia", "Iowan Old Style", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 30, 24, 0.06), 0 8px 24px -8px rgba(20, 30, 24, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
