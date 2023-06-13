import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  Client,
  Collection,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Message,
  SlashCommandBuilder,
  Snowflake,
  VoiceState,
} from "discord.js";
import { ensureCommand } from "src/discord/commands/ensure-command";
import {
  Handler,
  OnButton,
  OnCommand,
  OnInit,
  OnVoiceStateUpdate,
} from "src/discord/decorators";
import { getServerMember } from "src/discord/members/get-server-member";
import { sleep } from "src/util";

interface ActiveProcess {
  user: string;
  message: Message<true>;
  verifier?: string;
}

@Handler("verification")
export class Verification {
  verifiedRoleId = "1070742139249639454";
  verificationRoleId = "1114994081458823290";
  moderationRoleId = "1070722772034142298";
  textId = "1114995836225593444";
  voiceId = "1114995895344304219";
  gracePeriod = 30000;

  activeProcess?: ActiveProcess;
  lastUserId?: string;

  @OnInit()
  async onInit(client: Client<true>) {
    await ensureCommand(
      client,
      new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Verifiziere ein Servermitglied")
        .setDMPermission(false)
        .addUserOption(opt =>
          opt
            .setName("user")
            .setDescription("Das zu verifizierende Servermitglied")
            .setRequired(true),
        ),
    );
    await ensureCommand(
      client,
      new SlashCommandBuilder()
        .setName("unverify")
        .setDescription(
          "Entferne den Verifikations-Status eines Servermitglieds",
        )
        .setDMPermission(false)
        .addUserOption(opt =>
          opt
            .setName("user")
            .setDescription("Das zu verifizierende Servermitglied")
            .setRequired(true),
        ),
    );
  }

  @OnCommand("verify")
  async onCmdVerify(cmd: ChatInputCommandInteraction) {
    if (!(await this.cmdRequirements(cmd))) return;
    const member = cmd.options.getMember("user") as GuildMember;
    await member.roles.add(this.verifiedRoleId);
    const channel = await this.getTextChannel(cmd.guild);
    await channel.send({
      content: `${member} wurde durch ${cmd.member} verifiziert.`,
    });
    return cmd.deleteReply();
  }

  @OnCommand("unverify")
  async onCmdUnverify(cmd: ChatInputCommandInteraction) {
    if (!(await this.cmdRequirements(cmd))) return;
    const member = cmd.options.getMember("user") as GuildMember;
    await member.roles.remove(this.verifiedRoleId);
    const channel = await this.getTextChannel(cmd.guild);
    await channel.send({
      content: `Die Verifikation von ${member} wurde durch ${cmd.member} entfernt.`,
    });
    return cmd.deleteReply();
  }

  async cmdRequirements(cmd: ChatInputCommandInteraction) {
    const roles = (cmd.member as GuildMember).roles.cache;
    if (!roles.hasAny(this.verificationRoleId, this.moderationRoleId)) {
      await cmd.editReply({
        content: `Nur eine Person aus der <@&${this.verificationRoleId}> oder <@&${this.moderationRoleId}> kann personen verifizieren.`,
      });
      return false;
    }
    return true;
  }

  @OnVoiceStateUpdate()
  async onVoiceStatusUpdate(oldState: VoiceState, newState: VoiceState) {
    if (oldState.channelId === newState.channelId) return;
    if (newState.channelId !== this.voiceId) return;
    const { guild, member } = newState;
    if (this.lastUserId === member.user.id) return await newState.disconnect();
    const roles = member.roles;
    if (roles.cache.has(this.verificationRoleId))
      return this.onVerificationStarted(newState.member);
    if (roles.cache.has(this.verifiedRoleId)) return;
    else {
      await sleep(this.gracePeriod);
      const members = await this.getVoiceChannelMembers(guild);
      if (!members.has(member.id)) return;
      return this.onVerificationRequested(member);
    }
  }

  async onVerificationRequested(member: GuildMember) {
    if (this.activeProcess)
      await this.activeProcess.message.edit({
        content: `<@${this.activeProcess.user}> hat den channel verlassen.`,
      });
    const channel = await this.getTextChannel(member.guild);
    const content = await this.message(member, [
      `<@&${this.verificationRoleId}>: ${member} möchte verifiziert werden 🎉`,
      `Bitte betrete <#${this.voiceId}> um den Prozess zu starten.`,
    ]);
    const message = await channel.send({ content });
    this.activeProcess = { user: member.user.id, message };
    this.lastUserId = member.user.id;
  }

  async onVerificationStarted(member: GuildMember) {
    if (!this.activeProcess) return;
    this.activeProcess.verifier = member.user.id;
    const user = await member.guild.members.cache.get(this.activeProcess.user);
    const content = await this.message(user, [
      `<@${this.activeProcess.user}> wird durch <@${this.activeProcess.verifier}> verifiziert.`,
    ]);
    await this.activeProcess.message.edit({
      content,
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents([
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("Verifizieren")
            .setCustomId("verification:accept"),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Unsicher")
            .setCustomId("verification:abort"),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel("Ablehnen")
            .setCustomId("verification:reject"),
        ]),
      ],
    });
    await this.activeProcess.message.startThread({
      name: `Protokoll zu ${user.displayName}`,
      autoArchiveDuration: 60,
    });
  }

  @OnButton("accept")
  async onAccept(btn: ButtonInteraction) {
    await this.requirements(btn);
    const member = btn.guild.members.cache.get(this.activeProcess.user);
    await member.roles.add(this.verifiedRoleId);
    const content = await this.message(member, [
      `<@${this.activeProcess.user}> wurde durch <@${this.activeProcess.verifier}> verifiziert.`,
    ]);
    await this.activeProcess.message.edit({ content, components: [] });
    this.activeProcess = undefined;
    await btn.deleteReply();
  }

  @OnButton("abort")
  async onAbort(btn: ButtonInteraction) {
    await this.requirements(btn);
    const member = btn.guild.members.cache.get(this.activeProcess.user);
    const content = await this.message(member, [
      `Die Verifizierung von <@${this.activeProcess.user}> wurde durch <@${this.activeProcess.verifier}> abgebrochen.`,
    ]);
    await this.activeProcess.message.edit({ content, components: [] });
    this.activeProcess = undefined;
    await btn.deleteReply();
  }

  @OnButton("reject")
  async onReject(btn: ButtonInteraction) {
    await this.requirements(btn);
    const member = btn.guild.members.cache.get(this.activeProcess.user);
    const content = await this.message(member, [
      `Die Verifizierung von <@${this.activeProcess.user}> wurde von <@${this.activeProcess.verifier}> abgelehnt.`,
    ]);
    await this.activeProcess.message.edit({ content, components: [] });
    this.activeProcess = undefined;
    await btn.deleteReply();
  }

  async requirements(btn: ButtonInteraction) {
    if (!this.activeProcess) {
      await btn.reply({
        content: "Es ist keine Verifikation aktiv",
        ephemeral: true,
      });
      return false;
    }
    if (btn.member.user.id !== this.activeProcess.verifier) {
      await btn.reply({
        content: `Nur <@${this.activeProcess.verifier}> kann dies tun.`,
        ephemeral: true,
      });
      return false;
    }
    await btn.deferReply({ ephemeral: true });
    return true;
  }

  async message(member: GuildMember, text: string | string[]) {
    const data = await getServerMember(member);
    if (!data.suspect) return (Array.isArray(text) ? text : [text]).join("\n");
    return [
      ...(Array.isArray(text) ? text : [text]),
      "",
      "**Achtung**: die Person ist als verdächtig markiert.",
      `Eine Person aus der <@&${this.moderationRoleId}> sollte sich darum kümmern.`,
      `Mehr Infos in <#${data.suspectThreadId}>!`,
    ].join("\n");
  }

  _mentionChannel?: GuildTextBasedChannel;
  async getTextChannel(guild: Guild) {
    return (this._mentionChannel ??= guild.channels.cache.has(this.textId)
      ? (guild.channels.cache.get(this.textId)! as any)
      : ((await guild.channels.fetch(this.textId))! as any));
  }

  async getVoiceChannelMembers(
    guild: Guild,
  ): Promise<Collection<Snowflake, GuildMember>> {
    const channel = await guild.channels.fetch(this.voiceId);
    if (!channel.isVoiceBased()) throw new Error("voice errors");
    return channel.members;
  }
}
