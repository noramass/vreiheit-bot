import { MigrationInterface, QueryRunner } from "typeorm";
import sqlUp from "./1680779710292-toggle-poll-choice.up.sql";

export class TogglePollChoice1680779710292 implements MigrationInterface {
  public async up(qr: QueryRunner): Promise<any> {
    await qr.query(sqlUp);
  }

  public async down(qr: QueryRunner): Promise<any> {
    await qr.query(
      `drop function if exists toggle_poll_choice(pollId uuid,uid text,opt text);`,
    );
  }
}
