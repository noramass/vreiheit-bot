import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";
import tailwindConfig from "./tailwind.config.js";
// noinspection JSFileReferences
import tailwindNesting from "tailwindcss/nesting/index.js";

export default {
  plugins: [
    postcssImport(),
    tailwindNesting(),
    tailwindcss(tailwindConfig),
    autoprefixer(),
  ],
};
