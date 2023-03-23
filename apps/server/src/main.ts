import { dataSource, ServerMember } from "@vreiheit/database";
import { discordLogin } from "@vreiheit/discord";
import { env, isDev } from "@vreiheit/util";
import express, { Router, Express } from "express";

const app = express();
const path = "node_modules/@vreiheit/website/dist";

export async function main(): Promise<Express> {
  if (isDev()) console.log("development mode enabled");

  await dataSource.initialize();
  await dataSource.synchronize();
  await discordLogin();

  const api = Router();

  api.get("/members", async (req, res) => {
    res.json(await dataSource.getRepository(ServerMember).find());
  });

  app.use("/api", api);
  app.use("/api/*", (req, res) =>
    res.status(404).json({ status: 404, error: "Not Found" }),
  );

  app.use(express.static(path));
  // index fallback for non api routes
  app.use("*", express.static(`${path}/index.html`));

  return app;
}

if (!module.parent)
  main().then(app => {
    const port = env("vreiheit_port", 3000);
    app.listen(port, () => console.log(`http://localhost:${port}/`));
  });
