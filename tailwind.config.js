/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "aa-main": "#cf9fff",
        "aa-0": "#f5ecff",
        "aa-1": "#e9d2ff",
        "aa-2": "#dcb9ff",
        "aa-3": "#c286ff",
        "aa-4": "#b66cff",
        "aa-5": "#a953ff",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};