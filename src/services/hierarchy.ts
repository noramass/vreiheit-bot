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
}
