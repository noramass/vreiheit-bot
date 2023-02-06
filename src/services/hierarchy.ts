import {
  Client,
  CommandInteraction,
  Guild,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { ensureCommand } from "src/commands/ensure-command";
import {
  Handler,
  OnCommand,
  OnInit,
  OnMemberJoin,
  OnMemberLeave,
  OnMemberUpdate,
} from "src/decorators";
import { ServerMember } from "src/entities/server-member";
import { dataSource } from "src/init/data-source";
import {
  getServer,
  getServerMember,
  withServer,
  withServerMember,
} from "src/members/get-server-member";

@Handler("hierarchy")
export class HierarchyService {
  @OnInit()
  async onInit(client: Client<true>) {
    await ensureCommand(
      client,
      new SlashCommandBuilder()
        .setDMPermission(false)
        .setName("set-newcomer-role")
        .setDescription("Setzt die Rolle für neu beigetretene Benutzer*innen")
        .addRoleOption(builder =>
          builder.setName("role").setRequired(true).setDescription("Role"),
        ),
    );
    await ensureCommand(
      client,
      new SlashCommandBuilder()
        .setDMPermission(false)
        .setName("set-bot-role")
        .setDescription("Setzt die Rolle für Bots")
        .addRoleOption(builder =>
          builder.setName("role").setRequired(true).setDescription("Role"),
        ),
    );
    await ensureCommand(
      client,
      new SlashCommandBuilder()
        .setDMPermission(false)
        .setName("set-speaker-role")
        .setDescription("Setzt die Rolle für Menschen, die sprechen dürfen")
        .addRoleOption(builder =>
          builder.setName("role").setRequired(true).setDescription("Role"),
        ),
    );

    await this.everyTenMinutes(client);
    setInterval(this.everyTenMinutes.bind(this, client), 600000);
  }

  async everyTenMinutes(client: Client<true>) {
    for (const guild of client.guilds.cache.values()) {
      const speakerRole = await this.speakerRole(guild);
      if (!speakerRole) continue;
      const users = await dataSource
        .getRepository(ServerMember)
        .createQueryBuilder("member")
        .leftJoinAndSelect("member.guild", "server")
        .where(
          `member.createdAt < :date AND server.discordId = :serverId AND member.maySpeak = FALSE AND member.leftAt = NULL`,
          {
            date: new Date(new Date().getDate() - 86400000), // 48h
            serverId: guild.id,
          },
        )
        .getMany();
      for (const user of users) {
        const member = await guild.members.fetch(user.discordId);
        await member.roles.add(speakerRole);
        user.maySpeak = true;
      }
      if (users.length)
        await dataSource.getRepository(ServerMember).save(users);
    }
  }

  @OnCommand("set-newcomer-role")
  async onSetNewcomerRole(command: CommandInteraction) {
    if (!command.memberPermissions.has("Administrator")) return;
    await command.deferReply();
    await command.deleteReply();
    const { role } = command.options.get("role", true);
    await withServer(command.guildId, server => {
      server.newComerRoleId = role.id;
    });
  }

  @OnCommand("set-speaker-role")
  async onSetSpeakerRole(command: CommandInteraction) {
    if (!command.memberPermissions.has("Administrator")) return;
    await command.deferReply();
    await command.deleteReply();
    const { role } = command.options.get("role", true);
    await withServer(command.guildId, server => {
      server.speakerRoleId = role.id;
    });
  }

  @OnCommand("set-bot-role")
  async onSetBotRole(command: CommandInteraction) {
    if (!command.memberPermissions.has("Administrator")) return;
    await command.deferReply();
    await command.deleteReply();
    const { role } = command.options.get("role", true);
    await withServer(command.guildId, server => {
      server.botRoleId = role.id;
    });
  }

  @OnMemberJoin()
  async onMemberJoin(member: GuildMember) {
    if (member.user.bot) {
      const role = await this.botRole(member.guild);
      if (role) await member.roles.add(role);
    } else
      await withServerMember(member, async user => {
        user.leftAt = undefined;
        if (user.hierarchyRole) return;
        const role = await this.newComerRole(member.guild);
        if (role) await member.roles.add(role);
        user.hierarchyRole = role?.id;
      });
  }

  @OnMemberLeave()
  async onMemberLeave(member: GuildMember) {
    if (member.user.bot) return;
    await withServerMember(member, user => {
      user.leftAt = new Date();
    });
  }

  @OnMemberUpdate()
  async onMemberUpdate(_: GuildMember, member: GuildMember) {
    await getServerMember(member);
  }

  async newComerRole(guild: Guild) {
    const id = (await getServer(guild.id)).newComerRoleId;
    return id && guild.roles.fetch(id);
  }

  async botRole(guild: Guild) {
    const id = (await getServer(guild.id)).botRoleId;
    return id && guild.roles.fetch(id);
  }

  async speakerRole(guild: Guild) {
    const id = (await getServer(guild.id)).speakerRoleId;
    return id && guild.roles.fetch(id);
  }
}
