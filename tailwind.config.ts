import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F4F1EA",
        paper: "#FBF9F4",
        ink: "#241F18",
        "ink-soft": "#6B6459",
        line: "#E3DDCF",
        clay: "#D97757",
        "clay-dark": "#B85C3E",
        moss: "#5C6B4F",
        slate: "#4C5A66",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
