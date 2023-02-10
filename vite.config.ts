import { defineConfig, loadEnv } from "vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), ["VITE_"]);
  for (const [key, value] of Object.entries(env))
    env[key] = JSON.stringify(value);

  return {
    plugins: [viteReact({}), tsconfigPaths({ loose: true })],
    build: {
      rollupOptions: {
        input: "src/client/index.html",
      },
    },
    publicDir: "assets",
    // root: "src/client",
    server: {
      watch: {
        usePolling: true,
      },
      hmr: true,
      proxy: {
        "/api": "http://localhost:3000",
      },
    },
    define: env,
  };
});
