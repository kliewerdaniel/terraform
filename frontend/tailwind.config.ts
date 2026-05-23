import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bedrock: {
          50: "#f7f6f3",
          100: "#e8e5dd",
          200: "#d1cbb9",
          300: "#b5ab91",
          400: "#9e9071",
          500: "#8f7e5f",
          600: "#7b6a50",
          700: "#665545",
          800: "#56473c",
          900: "#4a3d35",
          950: "#2a211c",
        },
        sage: {
          50: "#f3f7f2",
          100: "#e3ede0",
          200: "#c7dcc1",
          300: "#a1c499",
          400: "#7aa870",
          500: "#5b8c52",
          600: "#466f3f",
          700: "#395934",
          800: "#30482c",
          900: "#283b25",
          950: "#132012",
        },
        dusk: {
          50: "#f4f6f9",
          100: "#e2e7f0",
          200: "#cbd4e4",
          300: "#a8b7d1",
          400: "#7f94ba",
          500: "#6277a3",
          600: "#4e5f88",
          700: "#414e6f",
          800: "#39435e",
          900: "#333a4f",
          950: "#222735",
        },
        ember: {
          50: "#fdf6ee",
          100: "#faeace",
          200: "#f4d39d",
          300: "#edb56b",
          400: "#e89341",
          500: "#e47a25",
          600: "#d4611a",
          700: "#b04919",
          800: "#8c3a1d",
          900: "#71311b",
          950: "#3d170b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.8s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "glow": "glow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(228, 147, 65, 0.1)" },
          "100%": { boxShadow: "0 0 40px rgba(228, 147, 65, 0.3)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
