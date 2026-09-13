import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f5f6f8",
          100: "#e8eaee",
          200: "#c9cedb",
          300: "#a3abc0",
          400: "#7c86a3",
          500: "#5f6889",
          600: "#4b5271",
          700: "#3d425c",
          800: "#2f334a",
          900: "#20222f",
          950: "#14151d",
        },
        accent: {
          50: "#eefbf3",
          100: "#d6f5e2",
          500: "#159a63",
          600: "#0f7d50",
          700: "#0d6543",
        },
        warn: {
          50: "#fff8ec",
          500: "#e0952b",
          600: "#c07a1a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
