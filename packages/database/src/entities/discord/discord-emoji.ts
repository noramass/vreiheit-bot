import { DiscordGuild } from "src/entities/discord/discord-guild";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("Emoji", { schema: "discord" })
export class DiscordEmoji extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar")
  name: string;

  @Column("bool")
  managed: boolean;

  @Column("bool")
  animated: boolean;

  @Column("bool")
  available: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => DiscordGuild, guild => guild.emojis, {
    nullable: true,
    cascade: ["remove"],
  })
  guild: DiscordGuild;
}
