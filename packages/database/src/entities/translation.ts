import { Server } from "src/entities/server";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("translation")
export class Translation {
  @PrimaryColumn("varchar")
  key!: string;

  @Column("varchar", { array: true })
  tags: string[];

  @Column("jsonb")
  translations!: Record<string, string>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Server, ({ blockedTerms }) => blockedTerms)
  guild!: Server;
}
