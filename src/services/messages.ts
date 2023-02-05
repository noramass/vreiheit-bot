import { Interaction } from "discord.js";
import { Handler, OnInteraction } from "src/decorators";

@Handler("messages")
export class Messages {
  @OnInteraction("delete")
  async onMessageDelete(
    interaction: Interaction,
    channelId: string,
    messageId: string,
  ) {
    if (!interaction.memberPermissions.has("ManageMessages"))
      return this.reply(
        interaction,
        "Du kannst keine Nachrichten verwalten...",
      );
    if ("deferUpdate" in interaction) await interaction.deferUpdate();
    let message = interaction.isMessageComponent() && interaction.message;
    if (channelId && messageId) {
      const channel = await interaction.guild.channels.fetch(channelId);
      message =
        channel &&
        channel.isTextBased() &&
        (await channel.messages.fetch(messageId));
    }
    if (message) await message.delete();
  }

  reply(interaction: Interaction, response: string) {
    if (!interaction.isRepliable()) return;
    interaction.reply({
      ephemeral: true,
      content: response,
    });
  }
}
