import {
  DC,
  DiscordElements as React,
  DiscordController,
  ensureCommand,
  OnAutocomplete,
  OnButton,
  OnChatCommand,
  OnInit,
  OnModalSubmit,
} from "@vreiheit/discord";
import { parseMs, sleep } from "@vreiheit/util";
import {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  GuildTextBasedChannel,
  ModalSubmitInteraction,
  TextInputStyle,
} from "discord.js";
import qs from "node:querystring";
import { lang } from "src/consts";
import { Init, Inject } from "src/mount";
import { FullPollOptions, PollOptions, PollService } from "src/services";
import { pollCommand } from "src/services/poll/command";
import t from "src/services/poll/translations.json";

@DiscordController("poll")
@Init
export class PollDiscordController {
  @Inject(() => PollService) pollService!: PollService;

  @OnInit
  async onInit(client: Client<true>) {
    await ensureCommand(client, pollCommand());
    for (const poll of await this.pollService.getAll())
      if (!poll.closed && client.guilds.cache.has(poll.guild?.discordId))
        await this.pollService.schedulePoll(poll.id, poll.conclusion);
  }

  @OnAutocomplete("poll", "poll")
  async onAutocompletePoll(
    @DC.Interaction auto: AutocompleteInteraction,
    @DC.Option.FocusedValue value: string,
  ) {
    const options = await this.pollService.findByTitle(auto.guildId, value);
    await auto.respond(
      options.map(option => ({ name: option.title, value: option.id })),
    );
  }
  @OnAutocomplete("poll", "timeframe")
  async onAutocompleteTimeframe(
    @DC.Interaction auto: AutocompleteInteraction,
    @DC.Option.FocusedValue value: string,
  ) {
    if (/\d+$/.test(value))
      await auto.respond(
        ["seconds", "minutes", "hours", "days", "weeks", "months"].map(it => ({
          name: value + it,
          value: parseMs(value + it),
        })),
      );
    else if (!value || !parseMs(value)) {
      await auto.respond(
        [
          "10minutes",
          "30minutes",
          "1hour",
          "2hours",
          "5hours",
          "12hours",
          "1day",
          "2days",
          "3days",
          "1week",
        ].map(name => ({ name, value: parseMs(name) })),
      );
    } else
      await auto.respond([
        {
          name: value,
          value: parseMs(value),
        },
      ]);
  }

  @OnChatCommand("poll", "create")
  async onCommandPollCreate(
    @DC.Interaction cmd: ChatInputCommandInteraction,
    @DC.Option.Value("title") title?: string,
    @DC.Option.Value("desc") desc?: string,
    @DC.Option.Value("options") optionsLine?: string,
    @DC.Option.Value("timeframe") timeframe: number = parseMs("1day"),
    @DC.Option.Value("multiple-choice") multiple: boolean = false,
    @DC.Option.Channel("channel") channel: GuildTextBasedChannel = cmd.channel,
  ) {
    const options = optionsLine?.split(",").map(it => it.trim()) ?? [];
    const pollOptions: PollOptions = {
      channelId: channel.id,
      multiple,
      timeframe,
      desc,
      title,
      options,
    };

    if (!title || !desc || !options)
      return await cmd.showModal(this.createPollModal(pollOptions));
    await cmd.deferReply({ ephemeral: true });
    await this.pollService.createPoll(
      cmd.guildId,
      pollOptions as FullPollOptions,
    );
  }

  @OnChatCommand("poll", "edit")
  async onCommandPollEdit(
    @DC.Interaction cmd: ChatInputCommandInteraction,
    @DC.Option.Value("poll") pollId: string,
    @DC.Option.Value("title") title?: string,
    @DC.Option.Value("desc") desc?: string,
    @DC.Option.Value("options") options?: string,
  ) {
    const poll = await this.pollService.findById(pollId);
    if (!title && !options && !desc)
      return await cmd.showModal(
        this.createPollModal({
          pollId,
          channelId: poll.channelId,
          timeframe: 0,
          title: poll.title,
          options: poll.options,
          desc: poll.description,
          multiple: !poll.single,
        }),
      );
    title = title?.trim();
    desc = desc?.trim();
    const opts = options
      ?.split(",")
      .map(it => it.trim())
      .filter(it => it);
    if (title) poll.title = title;
    if (desc) poll.description = desc;
    if (opts?.length) {
      poll.options = [...new Set(opts)];
      poll.counts = {};
    }
    await this.pollService.update(poll);
  }

  @OnChatCommand("poll", "abort")
  async onPollAbort(
    @DC.Interaction cmd: ChatInputCommandInteraction,
    @DC.Option.Value("poll") pollId: string,
  ) {
    await cmd.deferReply({ ephemeral: true });
    await this.cancelPollSchedule(pollId);
    await this.pollService.abortPoll(pollId);
  }

  @OnChatCommand("poll", "reset")
  async onPollReset(
    @DC.Interaction cmd: ChatInputCommandInteraction,
    @DC.Option.Value("poll") pollId: string,
  ) {
    await cmd.deferReply({ ephemeral: true });
    await this.pollService.resetPoll(pollId);
  }

  @OnChatCommand("poll", "conclude")
  async onPollConclude(
    @DC.Interaction cmd: ChatInputCommandInteraction,
    @DC.Option.Value("poll") pollId: string,
  ) {
    await cmd.deferReply({ ephemeral: true });
    await this.cancelPollSchedule(pollId);
    await this.pollService.concludePoll(pollId);
    // TODO: nyi
  }

  @OnModalSubmit("edit")
  async onPollModalEdit(modal: ModalSubmitInteraction, pollId: string) {
    await modal.deferReply({ ephemeral: true });
    const title = modal.fields.getTextInputValue("title").trim();
    const desc = modal.fields.getTextInputValue("desc").trim();
    const options = modal.fields
      .getTextInputValue("options")
      .split(/\r?\n/g)
      .map(it => it.trim())
      .filter(it => it);
    await this.pollService.editPoll(pollId, title, desc, options);
    await modal.editReply({
      content: this.translate("edit"),
    });
  }

  @OnButton("select")
  async onPollButtonPress(
    btn: ButtonInteraction,
    pollId: string,
    option: string,
  ) {
    await btn.deferReply({ ephemeral: true });
    const result = await this.pollService.togglePoll(
      pollId,
      btn.user.id,
      option.replaceAll("🤡", ":"),
    );
    await btn.editReply({
      content: `Option "${option}" wurde ${result ? "angewählt" : "abgewählt"}`,
    });
    await sleep("5s");
    await btn.deleteReply();
  }

  translate(
    key: keyof (typeof t)["actions"],
    state: keyof (typeof t)["actions"][typeof key] = "success",
    locale: string = lang,
  ) {
    const translations = t.actions[key][state];
    return translations[locale] ?? translations[lang];
  }

  async cancelPollSchedule(id: string) {
    if (this.pollService.scheduled[id])
      clearTimeout(this.pollService.scheduled[id]);
  }

  createPollModal({
    channelId,
    timeframe,
    multiple,
    pollId,
    title,
    desc,
    options,
  }: PollOptions) {
    const serialised = qs.stringify({ channelId, timeframe, multiple });
    return (
      <modal
        title={"create poll"}
        customId={`poll:${pollId ? "edit" : "create"}:${pollId || serialised}`}>
        <actionRow>
          <textInput
            style={TextInputStyle.Short}
            label={"titel"}
            customId="title"
            placeholder={"titel"}
            value={title ?? ""}
            required
          />
        </actionRow>
        <actionRow>
          <textInput
            style={TextInputStyle.Paragraph}
            label={"description"}
            customId="desc"
            placeholder={"description"}
            value={desc ?? ""}
            required
          />
        </actionRow>
        <actionRow>
          <textInput
            style={TextInputStyle.Paragraph}
            label={"options (one per row)"}
            customId="options"
            placeholder={"option 1\noption 2\noption 3"}
            value={options.join("\n") ?? ""}
            required
          />
        </actionRow>
      </modal>
    );
  }
}
