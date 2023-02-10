import { Server } from "src/database/entities/server";
import { stringList } from "src/database/transformers/string-list-transformer";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("poll")
export class Poll {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar")
  title!: string;

  @Column("varchar")
  description!: string;

  @Column("varchar", {
    transformer: stringList(";"),
  })
  options!: string[];

  @Column("jsonb")
  counts!: Record<string, string>;

  @Column("jsonb")
  results!: Record<string, number>;

  @Column("timestamp")
  conclusion!: Date;

  @Column("varchar")
  channelId!: string;

  @Column("varchar", { nullable: true })
  messageId?: string;

  @Column("boolean", { default: false })
  closed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Server, ({ polls }) => polls)
  guild!: Server;
}
