import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDiscordSchema1686520617705 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.createSchema("discord", true);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropSchema("discord", true, true);
  }
}
