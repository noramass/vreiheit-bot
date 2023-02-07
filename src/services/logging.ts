import {
  ActionRowBuilder,
  AuditLogEvent,
  ButtonBuilder,
  ButtonStyle,
  GuildAuditLogsEntry,
  GuildBan,
  Message,
  Role,
} from "discord.js";
import {
  Handler,
  OnBanCreate,
  OnBanDelete,
  OnMessageDelete,
  OnMessageUpdate,
  OnRoleCreate,
  OnRoleDelete,
  OnRoleUpdate,
} from "src/decorators";
import { modLog } from "src/logging/mod-log";
import { findChannel } from "src/messages";

@Handler()
export class LoggingService {
  @OnRoleCreate()
  async onRoleCreate(role: Role) {
    const fetchedLogs = await role.guild.fetchAuditLogs({
      type: AuditLogEvent.RoleCreate,
      limit: 1,
    });
    const roleLog: GuildAuditLogsEntry = fetchedLogs.entries.first();
    await modLog(role.guild, {
      content: `Die Rolle **${role.name}** wurde von **${roleLog.executor.username}#${roleLog.executor.discriminator}** erstellt`,
      components: [],
    });
  }

  @OnRoleUpdate()
  async onRoleUpdate(oldRole: Role, newRole: Role) {
    const fetchedLogs = await newRole.guild.fetchAuditLogs({
      type: AuditLogEvent.RoleUpdate,
      limit: 1,
    });
    const roleLog: GuildAuditLogsEntry = fetchedLogs.entries.first();
    if (oldRole.name === newRole.name) {
      await modLog(newRole.guild, {
        content: `Die Rolle **${oldRole.name}** wurde von **${roleLog.executor.username}#${roleLog.executor.discriminator}** verändert`,
        components: [],
      });
    } else {
      await modLog(newRole.guild, {
        content: `Die Rolle **${oldRole.name}** wurde von **${roleLog.executor.username}#${roleLog.executor.discriminator}** zu **${newRole.name}** geändert`,
        components: [],
      });
    }
  }

  @OnRoleDelete()
  async onRoleDelete(role: Role) {
    const fetchedLogs = await role.guild.fetchAuditLogs({
      type: AuditLogEvent.RoleDelete,
      limit: 1,
    });
    const roleLog: GuildAuditLogsEntry = fetchedLogs.entries.first();
    await modLog(role.guild, {
      content: `Die Rolle **${role.name}** wurde von **${roleLog.executor.username}#${roleLog.executor.discriminator}** gelöscht`,
      components: [],
    });
  }

  @OnBanCreate()
  async onBanCreate(ban: GuildBan) {
    const fetchedLogs = await ban.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberBanAdd,
      limit: 1,
    });
    const banLog: GuildAuditLogsEntry = fetchedLogs.entries.first();
    await modLog(ban.guild, {
      content: `**${ban.user.username}#${
        ban.user.discriminator
      }** wurde von **${banLog.executor.username}#${
        banLog.executor.discriminator
      }** gebannt: **${banLog.reason ?? "N/A"}**`,
      components: [],
    });
  }

  @OnBanDelete()
  async onBanDelete(unban: GuildBan) {
    const fetchedLogs = await unban.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberBanRemove,
      limit: 1,
    });
    const unbanLog: GuildAuditLogsEntry = fetchedLogs.entries.first();
    await modLog(unban.guild, {
      content: `**${unban.user.username}#${unban.user.discriminator}** wurde von **${unbanLog.executor.username}#${unbanLog.executor.discriminator}** entbannt`,
      components: [],
    });
  }

  //   @OnMessageCreate()
  //   async onMessageCreate(message: Message) {
  //     if (!message.author.bot) {
  //       let channel = await findChannel(message.guild, message.channelId);
  //       await modLog(message.guild, {
  //         content: `In **${channel.name}** schrieb **${message.author.username}#${message.author.discriminator}**: "${message.content}"`,
  //         components: [this.buildUserActionRow(message)],
  //       });
  //     }
  //   }

  @OnMessageUpdate()
  async onMessageUpdate(oldMessage: Message, newMessage: Message) {
    if (!newMessage.author.bot) {
      let channel = await findChannel(newMessage.guild, newMessage.channelId);
      await modLog(newMessage.guild, {
        content: `In **${channel.name}** überarbeitete **${newMessage.author.username}#${newMessage.author.discriminator}**: "${oldMessage.content}" zu "${newMessage.content}"`,
        components: [this.buildUserActionRow(newMessage)],
      });
    }
  }

  @OnMessageDelete()
  async onMessageDelete(message: Message) {
    if (!message.author.bot) {
      let channel = await findChannel(message.guild, message.channelId);
      await modLog(
        message.guild,
        `In **${channel.name}** wurde Nachricht von **${message.author.username}#${message.author.discriminator}** gelöscht: "${message.content}"`,
      );
    }
  }

  buildUserActionRow(
    message: Message,
    reason: string = "Unangebrachte Nachricht",
  ) {
    return new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setLabel("Löschen")
        .setCustomId(`messages:delete:${message.channelId}:${message.id}`)
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`members:kick:${message.author.id}:${reason}`)
        .setLabel("Kicken"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`members:ban:${message.author.id}:${reason}`)
        .setLabel("Bannen"),
    );
  }
}
