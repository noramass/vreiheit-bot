import { EnumColumn } from "src/decorators/enum";
import { AuditLogEvent } from "src/enums";
import { BaseEntity, Column, PrimaryColumn } from "typeorm";

export class DiscordAuditLogEntry extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar")
  targetId: string;

  @Column("varchar")
  userId: string;

  @Column("varchar")
  reason?: string;

  @EnumColumn(AuditLogEvent)
  actionType: AuditLogEvent;

  @Column("jsonb")
  changes?: DiscordAuditLogEntryChange<any>[];

  @Column("jsonb")
  options?: DiscordAuditLogEntryInfo;
}

export interface DiscordAuditLogEntryChange<T> {
  newValue?: T;
  oldValue?: T;
  key: string;
}

interface DiscordAuditLogEntryInfo {
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
