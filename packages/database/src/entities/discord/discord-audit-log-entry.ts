import { EnumColumn } from "src/decorators";
import { DiscordGuild } from "src/entities/discord/discord-guild";
import { DiscordAuditLogEventType } from "src/enums";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

@Entity("AuditLogEntry", { schema: "discord" })
export class DiscordAuditLogEntry extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar")
  guildId: string;

  @Column("varchar")
  targetId: string;

  @Column("varchar")
  userId: string;

  @Column("varchar")
  reason?: string;

  @EnumColumn({ DiscordAuditLogEventType })
  actionType: DiscordAuditLogEventType;

  @Column("jsonb")
  changes?: DiscordAuditLogEntryChange<any>[];

  @Column("jsonb")
  options?: DiscordAuditLogEntryInfo;

  @ManyToOne(() => DiscordGuild, guild => guild.auditLogEntries)
  @JoinColumn({ name: "guildId", referencedColumnName: "id" })
  guild: DiscordGuild;
}

export interface DiscordAuditLogEntryChange<T> {
  newValue?: T;
  oldValue?: T;
  key: string;
}

export interface DiscordAuditLogEntryInfo {
  applicationId?: string;
  autoModerationRuleName?: string;
  autoModerationRuleTriggerType?: string;
  channelId?: string;
  count?: string;
  deleteMemberDays?: string;
  id?: string;
  membersRemoved?: string;
  messageId?: string;
  roleName?: string;
  type?: string;
}
