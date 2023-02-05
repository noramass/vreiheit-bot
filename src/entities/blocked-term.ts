import { Server } from "src/entities/server";
import { ServerMember } from "src/entities/server-member";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("blocked-term")
export class BlockedTerm {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column("varchar", {
    transformer: [
      {
        to: (regex: RegExp) => regex.source,
        from: (source: string) => new RegExp(source, "i"),
      },
    ],
  })
  pattern!: RegExp;

  @Column("varchar", { default: "general" })
  tags!: string;

  @Column("varchar", { default: "warn" })
  action!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => ServerMember, ({ blockedTerms }) => blockedTerms)
  author!: ServerMember;

  @ManyToOne(() => Server, ({ blockedTerms }) => blockedTerms)
  guild!: Server;
}
