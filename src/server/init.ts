import express from "express";
import { env } from "src/util";

export const api = express();

export async function initApi(invite: string) {
  api.get("/ping", (req, res) => res.send("pong!"));
  api.get("/invite", (req, res) => res.redirect(invite));
  api.listen(env("api_port", 3000), () => console.log("api up!"));
}
