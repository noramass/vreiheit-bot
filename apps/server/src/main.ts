import express, { Express } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import { TypeormStore } from "connect-typeorm";
import { createExpressErrorHandler } from "@propero/easy-api";
import { dataSource, Session } from "@vreiheit/database";
import { discordLogin } from "@vreiheit/discord";
import { applyServices, discord } from "@vreiheit/discord";
import { env, isDev } from "@vreiheit/util";
import { api } from "src/mount";
import "src/services";

const app = express();
const path = "node_modules/@vreiheit/website/dist";

export async function main(): Promise<Express> {
  if (isDev()) console.log("development mode enabled");

  await dataSource.initialize();
  await dataSource.synchronize();
  await dataSource.runMigrations();

  app.use(
    cookieParser(),
    express.json(),
    express.urlencoded({ extended: true }),
    session({
      secret: env(
        "vreiheit_session_secret",
        "0b469091a5d2880470dfaaf4d2cad23d2a4fce63",
      ),
      resave: true,
      saveUninitialized: true,
      cookie: {},
      store: new TypeormStore({
        cleanupLimit: 2,
        limitSubquery: false,
        ttl: env("vreiheit_session_ttl", 86400),
      }).connect(dataSource.getRepository(Session)),
    }),
  );

  app.use("*", (req, res, next) => {
    console.log(req.method, req.originalUrl);
    next();
  });

  app.use(`/api`, api);

  applyServices(discord);
  await discordLogin();

  app.use("/api", createExpressErrorHandler());
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
