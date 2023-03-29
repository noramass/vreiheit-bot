import { defineConfig, loadEnv, PluginOption } from "vite";
import viteReact from "@vitejs/plugin-react";
// import { svelte } from "@sveltejs/vite-plugin-svelte";
// import sveltePreprocess from "svelte-preprocess";
import tsconfigPaths from "vite-tsconfig-paths";
import eslint from "vite-plugin-eslint";
import { fantasticon } from "vite-plugin-fantasticon";
import { generateFonts } from "@fukumong/fantasticon";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { exec as execLegacy } from "node:child_process";
const exec = promisify(execLegacy);

export default defineConfig(async ({ mode, command }) => {
  const env = loadEnv(mode, resolve(process.cwd(), "/../.."), [
    "VITE_",
    "NODE_ENV",
  ]);

  const { stdout: gitHash } = await exec("git rev-parse HEAD");

  Object.assign(env, {
    BUILD_MODE: command,
    GIT_HASH: gitHash.trim(),
  });

  return {
    plugins: [
      replaceImports([
        {
          pattern: /\bdotenv\b/,
          source: "export const config = () => {}",
        },
      ]),
      fantasticon({
        name: "icons",
        inputDir: "icons",
        pathOptions: { ts: "src/icons.ts" },
        generateFonts,
        injectHtml: false,
      }),
      viteReact(),
      // svelte({ preprocess: sveltePreprocess() }),
      tsconfigPaths({ loose: true }),
      eslint({ include: "src/**/*.tsx?" }),
    ],
    publicDir: "assets",
    server: {
      watch: { usePolling: true },
      hmr: true,
      proxy: {
        "/api": "http://localhost:3000",
      },
    },
    define: { process: { env } },
  };
});

interface ImportReplacement {
  pattern: string | RegExp | ((str: string) => boolean);
  source?: string | ((str: string) => Promise<string> | string);
  path?: string | ((str: string) => Promise<string> | string);
}

function replaceImports(replacements: ImportReplacement[]): PluginOption {
  function normalisePattern(
    pattern: ImportReplacement["pattern"],
  ): (str: string) => boolean {
    if (typeof pattern === "function") return pattern;
    if (typeof pattern === "string") return str => str === pattern;
    return str => pattern.test(str);
  }

  function normaliseSource(
    source: ImportReplacement["source"],
  ): undefined | ((str: string) => Promise<string> | string) {
    if (!source) return;
    if (typeof source === "function") return source;
    return () => source;
  }

  function normalisePath(
    path: ImportReplacement["path"],
  ): undefined | ((str: string) => Promise<string> | string) {
    if (!path) return;
    if (typeof path === "function") return path;
    return () => path;
  }

  const repl = Object.fromEntries(
    replacements.map(({ pattern, source, path }, id) => {
      pattern = normalisePattern(pattern);
      source = normaliseSource(source);
      path = normalisePath(path);
      return [id, { pattern, source, path, id }];
    }),
  );

  return {
    name: "replace-module",
    resolveId(toResolve) {
      for (const { pattern, path, id } of Object.values(repl)) {
        if (pattern(toResolve))
          if (path) return path(toResolve);
          else return `\0map:${id}:${toResolve}`;
      }
    },

    load(id) {
      if (!id.startsWith(`\0map:`)) return;
      const pathStart = id.indexOf(":", 6);
      const key = id.slice(5, pathStart);
      const path = id.slice(pathStart + 1);
      return repl[key].source(path);
    },
  };
}
