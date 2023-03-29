import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  sourcemap: true,
  clean: true,
  minify: false,
  dts: true,
  format: ["cjs", "esm"],
  target: "node18",
  outDir: "dist",
  esbuildPlugins: [],
});
