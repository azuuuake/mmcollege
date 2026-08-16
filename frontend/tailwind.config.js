/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#1A1410",
          900: "#2A211C",
          700: "#5C4E44",
          500: "#8A7A6E"
        },
        cream: {
          50: "#FBF7F2",
          100: "#F4EBE1",
          200: "#E8D5C4"
        },
        rose: {
          700: "#7A3344",
          600: "#8B3A4A",
          500: "#A24B5C"
        },
        gold: {
          500: "#C4A574",
          400: "#D4BC93"
        }
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Source Sans 3", "Helvetica Neue", "Arial", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 30px -18px rgba(26, 20, 16, 0.35)"
      }
    }
  },
  plugins: []
};
