import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0F4C81",
          foreground: "#FFFFFF"
        },
        bluechat: {
          navy: "#0F4C81",
          blue: "#1E88E5",
          light: "#E3F2FD",
          bg: "#F8FBFF",
          text: "#0F172A",
          muted: "#64748B"
        }
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      },
      boxShadow: {
        soft: "0 16px 50px rgba(15, 76, 129, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
