import { Interaction } from "discord.js";
import { Handler, InjectService, OnInteraction } from "src/discord/decorators";
import { modLog } from "src/discord/logging/mod-log";
import { HierarchyService } from "src/discord/services/hierarchy";

@Handler("members")
export class Members {
  @InjectService(() => HierarchyService)
  hierarchy!: HierarchyService;

  @OnInteraction("kick")
  async onKick(interaction: Interaction, userId: string, reason?: string) {
    if ("deferReply" in interaction)
      await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has("KickMembers"))
      return this.reply(interaction, "Du darfst keine Mitglieder kicken!");
    const target = await interaction.guild.members.fetch(userId);
    if (!target)
      return this.reply(interaction, "Dieses Mitglied existiert nicht");
    if (target.id === interaction.user.id)
      return this.reply(interaction, "Du kannst dich nicht selber kicken!");
    if (!(await this.hierarchy.isAbove(interaction.member as any, target)))
      return this.reply(
        interaction,
        "Du hast nicht die Berechtigung, dieses Mitglied zu kicken!",
      );
    await target.kick(
      `Gekickt durch ${interaction.user.username}: ${reason ?? "N/A"}`,
    );
    await modLog(
      interaction.guild,
      `${target.user.username} wurde durch ${
        interaction.user.username
      } gekickt: ${reason ?? "N/A"}`,
    );
    if (interaction.isRepliable())
      await interaction.editReply(`Mitglied gekickt!`);
    if (interaction.isMessageComponent())
      await interaction.message.edit({ components: [] });
  }

  @OnInteraction("ban")
  async onBan(interaction: Interaction, userId: string, reason?: string) {
    if ("deferReply" in interaction)
      await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has("BanMembers"))
      return this.reply(interaction, "Du darfst keine Mitglieder bannen!");
    const target = await interaction.guild.members.fetch(userId);
    if (!target)
      return this.reply(interaction, "Dieses Mitglied existiert nicht");
    if (target.id === interaction.user.id)
      return this.reply(interaction, "Du kannst dich nicht selber bannen!");
    if (!(await this.hierarchy.isAbove(interaction.member as any, target)))
      return this.reply(
        interaction,
        "Du hast nicht die Berechtigung, dieses Mitglied zu bannen!",
      );
    if (interaction.isRepliable()) await interaction.deferReply();
    await target.ban({
      reason: `Gebannt durch ${interaction.user.username}: ${reason ?? "N/A"}`,
    });
    await modLog(
      interaction.guild,
      `${target.user.username} wurde durch ${
        interaction.user.username
      } gebannt: ${reason ?? "N/A"}`,
    );
    if (interaction.isRepliable())
      await interaction.editReply(`Mitglied gebannt!`);
    if (interaction.isMessageComponent())
      await interaction.message.edit({ components: [] });
  }

  reply(interaction: Interaction, response: string) {
    if (!interaction.isRepliable()) return;
    if (interaction.deferred)
      return interaction.editReply({ content: response });
    else
      return interaction.reply({
        ephemeral: true,
        content: response,
      });
  }
}
