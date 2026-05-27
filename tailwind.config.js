/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        cream: {
          50: "#FBF9F5",
          100: "#F5F1EA",
          200: "#EAE3D7",
          300: "#D9CFBE",
        },
        ink: {
          50: "#F6F5F3",
          100: "#E8E5E0",
          200: "#C4BFB8",
          400: "#6B6864",
          600: "#363330",
          800: "#1A1916",
          900: "#0E0D0B",
        },
        accent: {
          DEFAULT: "#C2562A",
          soft: "#E8A982",
          ink: "#7A3318",
        },
        success: "#3F6E4A",
        warning: "#B5832C",
        danger: "#A23A2A",
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,13,11,0.04), 0 8px 24px -12px rgba(14,13,11,0.10)",
        cardHover:
          "0 2px 4px rgba(14,13,11,0.05), 0 24px 48px -20px rgba(14,13,11,0.18)",
        soft: "0 1px 0 rgba(14,13,11,0.04), 0 6px 14px -8px rgba(14,13,11,0.10)",
      },
      letterSpacing: {
        tightish: "-0.02em",
        tighter2: "-0.035em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
