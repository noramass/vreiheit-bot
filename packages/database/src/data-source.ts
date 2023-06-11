import "src/shims";
import * as entities from "./entities";
import { env, isDev, PromiseOr } from "@vreiheit/util";
import { TogglePollChoice1680779710292 } from "./migrations/1680779710292-toggle-poll-choice";
import { DataSource, EntityTarget, FindOptionsWhere } from "typeorm";

export const dataSource = new DataSource({
  type: "postgres",
  host: env("postgres_host", "localhost"),
  port: env("postgres_port", 5432),
  database: env("postgres_db", "vreiheit-discord"),
  username: env("postgres_user", "vreiheit"),
  password: env("postgres_password", "vreiheit"),
  synchronize: true,
  logger: "debug",
  logging: isDev(),
  entities: Object.values(entities),
  migrations: [TogglePollChoice1680779710292],
  subscribers: [],
});

export async function withResource<T>(
  cls: EntityTarget<T>,
  where: FindOptionsWhere<T>,
  fn: (poll: T) => PromiseOr<void>,
) {
  let ret: T;
  await dataSource.transaction(async t => {
    const repo = t.getRepository(cls);
    const result = await repo.findOne({ where });
    await fn(result);
    return (ret = await repo.save(result));
  });
  return ret;
}
