import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate3d(0,0,0) scale(1)" },
          "100%": { transform: "translate3d(60px,40px,0) scale(1.15)" },
        },
        shimmer: { to: { backgroundPosition: "200% center" } },
        rise: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fade: { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        drift: "drift 24s ease-in-out infinite alternate",
        shimmer: "shimmer 10s linear infinite",
        rise: "rise 0.4s ease-out",
        fade: "fade 0.8s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
