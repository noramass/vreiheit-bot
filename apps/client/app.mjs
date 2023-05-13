import next from "next";
import { isDev, env } from "@vreiheit/util";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

process.chdir(dirname(fileURLToPath(import.meta.url)));

export const nextApp = next({
  dev: isDev(),
  hostname: env("vreiheit_host", "localhost"),
  port: env("vreiheit_port", 3001),
  customServer: true,
  dir: dirname(fileURLToPath(import.meta.url)),
});
