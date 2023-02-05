import { BlockedTerm } from "src/entities/blocked-term";
import { Server } from "src/entities/server";
import { ServerMember } from "src/entities/server-member";
import { env } from "src/util";
import { DataSource } from "typeorm";

export const dataSource = new DataSource({
  type: "postgres",
  host: env("POSTGRES_HOST", "localhost"),
  port: env("POSTGRES_PORT", 5432),
  database: env("POSTGRES_DB", "vreiheit-discord"),
  username: env("POSTGRES_USER", "vreiheit"),
  password: env("POSTGRES_PASSWORD", "vreiheit"),
  synchronize: true,
  entities: [BlockedTerm, Server, ServerMember],
  migrations: [],
  subscribers: [],
});
