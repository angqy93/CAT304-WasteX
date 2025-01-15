import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        all: "0 0 12px 0 rgba(0, 0, 0, 0.12)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        green: "#96F49D",
        red: "#FF385C",
        productBG: "#f1f1f1",
      },
    },
  },
  plugins: [],
};
export default config;
