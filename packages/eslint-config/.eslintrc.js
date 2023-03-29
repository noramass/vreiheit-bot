module.exports = {
  $schema: "https://json.schemastore.org/eslintrc",
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "@html-eslint"],
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        arrowParens: "avoid",
        bracketSameLine: true,
        htmlWhitespaceSensitivity: "css",
        proseWrap: "always",
        singleQuote: false,
        printWidth: 80,
        plugins: [],
        semi: true,
        tabWidth: 2,
        useTabs: false,
        jsxSingleQuote: false,
        quoteProps: "consistent",
        bracketSpacing: true,
        endOfLine: "lf",
        trailingComma: "all",
      },
    ],
    "no-console": "warn",
    "no-debugger": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "_|DiscordElements",
      },
    ],
    "@html-eslint/indent": ["error", 2],
    "@html-eslint/require-closing-tags": [
      "error",
      {
        selfClosing: "always",
        allowSelfClosingCustom: true,
      },
    ],
    "@html-eslint/no-extra-spacing-attrs": [
      "error",
      {
        enforceBeforeSelfClose: true,
      },
    ],
  },
  overrides: [
    {
      files: ["**/test/**/*.test.{j,t}s?(x)"],
      env: { jest: true, node: true },
      rules: {
        "@typescript-eslint/ban-ts-comment": "off",
      },
    },
    {
      files: ["*.html"],
      parser: "@html-eslint/parser",
      extends: ["plugin:@html-eslint/recommended"],
    },
    /*{
      files: ["*.css"],
      extends: ["plugin:tailwindcss/recommended"],
      rules: {
        "prettier/prettier": [
          "error",
          {
            arrowParens: "avoid",
            bracketSameLine: true,
            htmlWhitespaceSensitivity: "css",
            proseWrap: "always",
            singleQuote: false,
            printWidth: 80,
            plugins: [require("prettier-plugin-tailwindcss")],
            semi: true,
            tabWidth: 2,
            useTabs: false,
            jsxSingleQuote: false,
            quoteProps: "consistent",
            bracketSpacing: true,
            endOfLine: "lf",
            trailingComma: "all",
          },
        ],
      },
    },*/
  ],
  ignorePatterns: [
    "node_modules",
    "**/node_modules/**/*",
    "**/dist/**",
    "dist",
  ],
};
