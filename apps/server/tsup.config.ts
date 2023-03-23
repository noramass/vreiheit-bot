import { defineConfig } from "tsup";

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
    outDir: "dist",
    esbuildPlugins: [],
  };
});
