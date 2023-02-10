/* eslint-disable @typescript-eslint/no-var-requires */
// noinspection JSFileReferences
const plugin = require("tailwindcss/plugin.js");

function colorCssVar(name) {
  return `rgba(var(--${name}), <alpha-value>)`;
}

function colorCssVarGradient(prefix) {
  return Object.fromEntries(
    [100, 200, 300, 400, 500, 600, 700, 800, 900]
      .map(level => {
        return [level, colorCssVar(prefix + level)];
      })
      .concat([["DEFAULT", colorCssVar(prefix + 500)]]),
  );
}

function spacings(theme) {
  return {
    "auto": "auto",
    "fit-content": "fit-content",
    ...theme("screens"),
    ...theme("spacing"),
    ...theme("fractions"),
  };
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./**/*.{ts,tsx}"],
  theme: {
    textShadow: {
      sm: "0 1px 2px var(--tw-shadow-color)",
      DEFAULT: "0 2px 1px var(--tw-shadow-color)",
      lg: "0 8px 16px var(--tw-shadow-color)",
    },
    fractions: {
      "1/2": "50%",
      "1/3": "33.333333%",
      "2/3": "66.666667%",
      "1/4": "25%",
      "2/4": "50%",
      "3/4": "75%",
      "1/5": "20%",
      "2/5": "40%",
      "3/5": "60%",
      "4/5": "80%",
      "1/6": "16.666667%",
      "2/6": "33.333333%",
      "3/6": "50%",
      "4/6": "66.666667%",
      "5/6": "83.333333%",
      "full": "100%",
    },
    extend: {
      colors: {
        f: colorCssVarGradient("colorFg"),
        b: colorCssVarGradient("colorBg"),
        a: colorCssVarGradient("colorAccent"),
      },
      fontFamily: {
        mono: "var(--fontMono)",
        sans: "var(--fontSans)",
      },
      animation: {
        "fadein": "fadein 1s ease-out",
        "fadein-slow": "fadein 2s ease-out",
      },
      keyframes: {
        fadein: {
          from: { opacity: "0%" },
          to: { opacity: "100%" },
        },
        fadeout: {
          from: { opacity: "100%" },
          to: { opacity: "0%" },
        },
      },
      minHeight: spacings,
      minWidth: spacings,
      maxHeight: spacings,
      maxWidth: spacings,
      content: {
        space: "' '",
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        { "text-shadow": value => ({ textShadow: value }) },
        { values: theme("textShadow") },
      );
    }),
  ],
};
