import { BlockedTerm } from "src/entities/blocked-term";
import { Server } from "src/entities/server";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("member")
export class ServerMember {
  @PrimaryGeneratedColumn("uuid")
  uuid!: string;

  @Column("varchar", { unique: true })
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

  @Column("timestamp", { nullable: true })
  leftAt?: Date;


  @OneToMany(() => BlockedTerm, ({ author }) => author)
  blockedTerms!: BlockedTerm[];

  @ManyToOne(() => Server, ({ members }) => members)
  guild!: Server;
}
