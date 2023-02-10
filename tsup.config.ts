import { defineConfig } from "tsup";
import eslint from "esbuild-plugin-eslint";

export default defineConfig(({ watch }) => {
  return {
    entry: ["src/main.ts"],
    sourcemap: !!watch,
    onSuccess: watch ? "pnpm run start" : undefined,
    clean: true,
    minify: !watch,
    dts: !watch,
    format: ["cjs"],
    target: "node16",
    outDir: "dist/server",
    esbuildPlugins: [eslint()],
  };
});
