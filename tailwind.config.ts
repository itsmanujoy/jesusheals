import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        church: {
          // Vibrant blues and purples for a modern spiritual tech look
          blue: "#3b82f6", 
          gold: "#fbbf24",
          white: "#ffffff",
          dark: "#0a0a0c",
          accent: "#8b5cf6",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-out": "fadeOut 0.3s ease-out forwards",
        "flash-green": "flashGreen 0.4s ease-in-out",
        "flash-red": "flashRed 0.4s ease-in-out",
        "countdown": "countdown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "shine": "shine 1.5s ease-in-out infinite",
        "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 8s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        flashGreen: {
          "0%, 100%": { backgroundColor: "transparent", boxShadow: "none" },
          "50%": { backgroundColor: "rgba(34, 197, 94, 0.2)", boxShadow: "0 0 20px rgba(34, 197, 94, 0.2)" },
        },
        flashRed: {
          "0%, 100%": { backgroundColor: "transparent", boxShadow: "none" },
          "50%": { backgroundColor: "rgba(239, 68, 68, 0.2)", boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)" },
        },
        countdown: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shine: {
          "0%": { left: "-100%" },
          "100%": { left: "200%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.05)" },
        }
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))",
      }
    },
  },
  plugins: [],
};
export default config;