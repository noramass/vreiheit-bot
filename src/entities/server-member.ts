import { BlockedTerm } from "src/entities/blocked-term";
import { Server } from "src/entities/server";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

@Entity("member")
@Unique("discordId_server", ["discordId", "guild"])
export class ServerMember {
  @PrimaryGeneratedColumn("uuid")
  uuid!: string;

  @Column("varchar")
  discordId!: string;

  @Column("varchar")
  username!: string;

  @Column("varchar")
  discriminator!: string;

  @Column("varchar", { nullable: true })
  pronouns?: string;

  @Column("varchar", { nullable: true })
  avatarUrl?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => BlockedTerm, ({ author }) => author)
  blockedTerms!: BlockedTerm[];

  @ManyToOne(() => Server, ({ members }) => members)
  guild!: Server;
}
