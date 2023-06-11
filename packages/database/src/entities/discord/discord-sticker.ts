import { EnumColumn } from "src/decorators/enum";
import { DiscordGuild } from "src/entities/discord/discord-guild";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import { DiscordUser } from "src/entities/discord/discord-user";
import { DiscordStickerFormatType } from "src/enums";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

@Entity("Sticker", { schema: "discord" })
export class DiscordSticker extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @PrimaryColumn("varchar")
  guildId: string;

  @Column("varchar")
  userId: string;

  @Column("varchar")
  name: string;

  @Column("varchar", { nullable: true })
  description?: string;

  @Column("varchar")
  tags: string;

  @EnumColumn({ DiscordStickerFormatType })
  formatType: DiscordStickerFormatType;

  @Column("bool", { default: true })
  available: boolean;

  @ManyToOne(() => DiscordGuild, guild => guild.stickers)
  @JoinColumn({ name: "guildId" })
  guild: DiscordGuild;

  @ManyToOne(() => DiscordGuildMember, member => member.uploadedStickers)
  @JoinColumn([
    { name: "guildId", referencedColumnName: "guildId" },
    { name: "userId", referencedColumnName: "userId" },
  ])
  uploadedBy: DiscordGuildMember;
}
