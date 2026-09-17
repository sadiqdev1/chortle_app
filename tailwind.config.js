/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Chortle palette ─────────────────────────────────
        bg:          "#FAFAF8",
        "bg-card":   "#F1F0EB",
        "bg-input":  "#F1F0EB",
        elevated:    "#FFFFFF",
        border:      "#E4E2DA",
        "border-light": "#EDEBE3",

        ink:         "#111111",
        accent:      "#FF5A1F",
        "accent-soft": "#FFEDE3",

        "text-primary":   "#111111",
        "text-secondary": "#63625C",
        "text-muted":     "#A5A399",
        "text-inverse":   "#FAFAF8",

        success: "#2F6B4F",
        error:   "#C0392B",
        warning: "#8A6D1B",

        rose:        "#C0392B",
        "rose-soft": "#FAE8E6",
        amber:       "#92640A",
        "amber-soft":"#FEF3CD",
        purple:      "#5B3FA6",
        "purple-soft":"#EDE8FB",
      },
      borderRadius: {
        sm:   "6px",
        md:   "10px",
        lg:   "14px",
        xl:   "18px",
        "2xl":"24px",
        full: "9999px",
      },
      fontFamily: {
        sans:         ["Inter_400Regular"],
        "sans-md":    ["Inter_500Medium"],
        "sans-semi":  ["Inter_600SemiBold"],
        "sans-bold":  ["Inter_700Bold"],
        serif:        ["Fraunces_600SemiBold"],
        "serif-bold": ["Fraunces_700Bold"],
      },
    },
  },
  plugins: [],
};
