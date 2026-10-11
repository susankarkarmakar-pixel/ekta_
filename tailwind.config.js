const { themeColors } = require("./theme.config");
const plugin = require("tailwindcss/plugin");

const tailwindColors = Object.fromEntries(
  Object.entries(themeColors).map(([name, swatch]) => [
    name,
    {
      DEFAULT: `var(--color-${name})`,
      light: swatch.light,
      dark: swatch.dark,
    },
  ]),
);

const brandColors = {
  terracotta: { DEFAULT: '#B4492A', dark: '#E8795A' },
  leaf: { DEFAULT: '#2E6B4A', dark: '#6DBF8F' },
  ochre: { DEFAULT: '#E0A24A', dark: '#F2C56B' },
  navy: { DEFAULT: '#14213D', dark: '#F5F7FA' },
  ivory: { DEFAULT: '#FBF6EC', dark: '#14213D' },
  paper: { DEFAULT: '#FFFDF8', dark: '#1C2638' },
  slate: { DEFAULT: '#5B6478', dark: '#C8D0DC' },
  line: { DEFAULT: '#E6DCC8', dark: '#35445A' },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // Scan all component and app files for Tailwind classes
  content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}", "./lib/**/*.{js,ts,tsx}", "./hooks/**/*.{js,ts,tsx}"],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: { ...tailwindColors, brand: brandColors },
      fontFamily: {
        sans: ['HindSiliguri', 'HindSiliguriLatin', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'NotoSerifBengali', 'serif'],
        bengali: ['NotoSerifBengali', 'HindSiliguri', 'serif'],
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("light", ':root:not([data-theme="dark"]) &');
      addVariant("dark", ':root[data-theme="dark"] &');
    }),
  ],
};
