import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { ensureCommand } from "src/discord/commands/ensure-command";
import { Handler, OnCommand, OnInit } from "src/discord/decorators";

@Handler("slowmode")
export class GlobalSlowmodeService {
  @OnInit()
  async onInit(client: Client<true>) {
    await ensureCommand(
      client,
      new SlashCommandBuilder()
        .setName("slowmode")
        .setDMPermission(false)
        .setDescription("Schaltet den serverweiten Slowmode ein oder aus.")
        .addBooleanOption(opt => {
          return opt
            .setName("off")
            .setDescription("Ob der Slowmode ausgeschaltet werden soll")
            .setRequired(false);
        })
        .addIntegerOption(opt => {
          return opt
            .setName("interval")
            .setDescription("Interval in Sekunden")
            .addChoices(
              {
                name: "eine Minute",
                value: 60,
              },
              {
                name: "zwei Minuten",
                value: 120,
              },
              {
                name: "fünf Minuten",
                value: 300,
              },
              {
                name: "zehn Minuten",
                value: 600,
              },
              {
                name: "zwanzig Minuten",
                value: 1200,
              },
              {
                name: "dreißig Minuten",
                value: 1800,
              },
              {
                name: "eine Stunde",
                value: 3200,
              },
            )
            .setRequired(false);
        }),
    );
  }

  @OnCommand("slowmode")
  async onSlowmodeCommand(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has("Administrator"))
      return await interaction.editReply(
        "Du hast nicht die Berechtigung um Kanäle zu verwalten.",
      );
    const on = !interaction.options.get("off", false)?.value;
    const interval =
      (interaction.options.get("interval", false)?.value as number) ?? 120;
    const channels = await interaction.guild.channels.fetch();
    if (on) {
      for (const channel of channels.values())
        if (channel.isTextBased())
          await channel.setRateLimitPerUser(interval, "global slowmode");
    } else {
      for (const channel of channels.values())
        if (channel.isTextBased()) await channel.setRateLimitPerUser(0);
    }
    await interaction.editReply(
      `Serverweiter Slowmode ${on ? "aktiviert" : "deaktiviert"}.`,
    );
  }
}
