import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  sourcemap: true,
  clean: true,
  minify: true,
  dts: true,
  format: ["cjs", "esm"],
  target: "node18",
  outDir: "dist",
  esbuildPlugins: [],
  loader: { ".sql": "text" },
});
