import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F2942", // deep professional blue
          hover: "#1E3D5C",   // lighter professional blue for hover states
          light: "#F0F4F8",   // very soft blue background accent
        },
        success: {
          DEFAULT: "#059669", // professional muted emerald green
          hover: "#047857",
          light: "#ECFDF5",
        },
        warning: {
          DEFAULT: "#D97706", // amber warning color
          hover: "#B45309",
          light: "#FEF3C7",
        },
        brandgray: {
          light: "#FAF8F2",   // light cream background
          border: "#E5E7EB",  // standard border gray
          text: "#1F2937",    // dark gray for readable body text
          muted: "#6B7280",   // muted text gray
        },
        white: "#FFFEFA",     // warm white card background
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        standard: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      }
    },
  },
  plugins: [],
};
export default config;
