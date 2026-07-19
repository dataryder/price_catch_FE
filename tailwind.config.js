/** @type {import('tailwindcss').Config} */
import { preset } from "@govtechmy/myds-style";
export default {
  darkMode: "selector",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx,html}",
    "./node_modules/@govtechmy/myds-react/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  presets: [preset],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans Flex Variable"', '"Google Sans"', "Inter", "sans-serif"],
        body: ['"Google Sans Flex Variable"', '"Google Sans"', "Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
