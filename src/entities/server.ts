import { BlockedTerm } from "src/entities/blocked-term";
import { ServerMember } from "src/entities/server-member";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("guild")
export class Server {
  @PrimaryGeneratedColumn("uuid")
  uuid!: string;

  @Column("varchar", { unique: true })
  discordId!: string;

  @Column("varchar")
  name!: string;

  @Column("varchar", { nullable: true })
  description?: string;

  @Column("varchar", { nullable: true })
  icon?: string;

  @Column("varchar", { nullable: true })
  splash?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => BlockedTerm, ({ guild }) => guild)
  blockedTerms!: BlockedTerm[];

  @OneToMany(() => ServerMember, ({ guild }) => guild)
  members!: ServerMember[];
}
