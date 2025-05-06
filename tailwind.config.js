/** @type {import('tailwindcss').Config} */
import { preset } from "@govtechmy/myds-style";
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [preset],
  theme: {
    extend: {},
  },
  plugins: [],
}

