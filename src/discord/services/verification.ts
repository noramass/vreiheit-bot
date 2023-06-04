import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Message,
  VoiceState,
} from "discord.js";
import { Handler, OnButton, OnVoiceStateUpdate } from "src/discord/decorators";

interface ActiveProcess {
  user: string;
  message: Message<true>;
  verifier?: string;
}

@Handler("verification")
export class Verification {
  verifiedRoleId = "1070742139249639454";
  verificationRoleId = "1114994081458823290";
  textId = "1114995836225593444";
  voiceId = "1114995895344304219";

  activeProcess?: ActiveProcess;
  lastUserId?: string;

  @OnVoiceStateUpdate()
  async onVoiceStatusUpdate(oldState: VoiceState, newState: VoiceState) {
    if (oldState.channelId === newState.channelId) return;
    if (newState.channelId !== this.voiceId) return;
    if (this.lastUserId === newState.member.user.id) return;
    const roles = newState.member.roles;
    if (roles.cache.has(this.verifiedRoleId)) return;
    if (roles.cache.has(this.verificationRoleId))
      return this.onVerificationStarted(newState.member);
    else return this.onVerificationRequested(newState.member);
  }

  async onVerificationRequested(member: GuildMember) {
    const channel = await this.getTextChannel(member.guild);
    const message = await channel.send({
      content: `<@&${this.verificationRoleId}>: ${member} möchte verifiziert werden 🎉\nBitte betrete <#${this.voiceId}> um den Prozess zu starten.`,
    });
    this.activeProcess = { user: member.user.id, message };
    this.lastUserId = member.user.id;
  }

  async onVerificationStarted(member: GuildMember) {
    if (!this.activeProcess) return;
    this.activeProcess.verifier = member.user.id;
    await this.activeProcess.message.edit({
      content: `<@${this.activeProcess.user}> wird durch <@${this.activeProcess.verifier}> verifiziert.`,
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
  }

  @OnButton("accept")
  async onAccept(btn: ButtonInteraction) {
    if (!this.activeProcess)
      return btn.reply({
        content: "Es ist keine Verifikation aktiv",
        ephemeral: true,
      });
    if (btn.member.user.id !== this.activeProcess.verifier)
      return btn.reply({
        content: `Nur <@${this.activeProcess.verifier}> kann dies tun.`,
        ephemeral: true,
      });
    await btn.deferReply({ ephemeral: true });
    await btn.guild.members.cache
      .get(this.activeProcess.user)
      .roles.add(this.verifiedRoleId);
    await this.activeProcess.message.edit({
      content: `<@${this.activeProcess.user}> wurde durch <@${this.activeProcess.verifier}> verifiziert.`,
      components: [],
    });
    this.activeProcess = undefined;
    await btn.deleteReply();
  }

  @OnButton("abort")
  async onAbort(btn: ButtonInteraction) {
    if (!this.activeProcess)
      return btn.reply({
        content: "Es ist keine Verifikation aktiv",
        ephemeral: true,
      });
    if (btn.member.user.id !== this.activeProcess.verifier)
      return btn.reply({
        content: `Nur <@${this.activeProcess.verifier}> kann dies tun.`,
        ephemeral: true,
      });
    await btn.deferReply({ ephemeral: true });
    await this.activeProcess.message.edit({
      content: `Die Verifizierung von <@${this.activeProcess.user}> wurde durch <@${this.activeProcess.verifier}> abgebrochen.`,
      components: [],
    });
    this.activeProcess = undefined;
    await btn.deleteReply();
  }

  @OnButton("reject")
  async onReject(btn: ButtonInteraction) {
    if (!this.activeProcess)
      return btn.reply({
        content: "Es ist keine Verifikation aktiv",
        ephemeral: true,
      });
    if (btn.member.user.id !== this.activeProcess.verifier)
      return btn.reply({
        content: `Nur <@${this.activeProcess.verifier}> kann dies tun.`,
        ephemeral: true,
      });
    await btn.deferReply({ ephemeral: true });
    await this.activeProcess.message.edit({
      content: `Die Verifizierung von <@${this.activeProcess.user}> wurde von <@${this.activeProcess.verifier}> abgelehnt.`,
      components: [],
    });
    this.activeProcess = undefined;
    await btn.deleteReply();
  }

  _mentionChannel?: GuildTextBasedChannel;
  async getTextChannel(guild: Guild) {
    return (this._mentionChannel ??= guild.channels.cache.has(this.textId)
      ? (guild.channels.cache.get(this.textId)! as any)
      : ((await guild.channels.fetch(this.textId))! as any));
  }
}
