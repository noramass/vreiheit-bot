import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";
import tailwindConfig from "./tailwind.config.js";

export default {
  plugins: [tailwindcss(tailwindConfig), autoprefixer(), postcssImport()],
};
