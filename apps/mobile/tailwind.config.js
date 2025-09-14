/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../packages/ui/**/*.{js,jsx,ts,tsx}",
    "../packages/theme/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0F1B2E",
        surface: "#13233C",
        line: "rgba(255,255,255,0.08)",
        text: "#F8FAFC",
        textmuted: "#B6C3D7",
        accent: "#3A8DFF",
        accentPressed: "#3077E0",
        accentAlt: "#60A5FA",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3A8DFF"
      },
      borderRadius: { xs: "6px", sm: "8px", md: "12px", lg: "16px" },
      spacing: { 1: "4px", 2: "8px", 3: "12px", 4: "16px" }
    }
  },
  plugins: []
};