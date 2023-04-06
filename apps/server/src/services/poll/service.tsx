import { Service } from "@propero/easy-api";
import { Poll, dataSource, Safe, defineProcedure } from "@vreiheit/database";
import {
  DC,
  discord,
  DiscordService,
  ensureCommand,
  getSingleCached,
  OnAutocomplete,
  OnButton,
  OnChatCommand,
  OnInit,
  OnModalSubmit,
} from "@vreiheit/discord";
import { chunks, parseMs, sleep } from "@vreiheit/util";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  GuildTextBasedChannel,
  TextInputStyle,
  ButtonStyle,
  ButtonInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import { lang } from "src/consts";
import { getServer } from "src/util";
import t from "./translations.json";
import { pollCommand } from "./command";
import { Repository } from "typeorm";
import { DiscordElements as React } from "@vreiheit/discord";
import qs from "node:querystring";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

interface PollOptions {
  channelId: string;
  timeframe: number;
  multiple: boolean;
  options: string[];
  pollId?: string;
  title?: string;
  desc?: string;
}

type FullPollOptions = Required<PollOptions>;

@DiscordService("poll")
@Service("/poll")
export class PollService {
  scheduled: Record<string, number> = {};
  get repo(): Repository<Poll> {
    return dataSource.getRepository(Poll);
  }

  chart = new ChartJSNodeCanvas({
    width: 400,
    height: 400,
    backgroundColour: "transparent",
  });

  togglePoll = defineProcedure<[string, string, string], boolean>(
    "toggle_poll_choice",
  );

  @OnInit
  async onInit(client: Client<true>) {
    await ensureCommand(client, pollCommand());
    for (const poll of await this.repo.find({ relations: ["guild"] }))
      if (!poll.closed && poll.guild)
        await this.schedulePoll(poll.id, poll.conclusion);
  }

  @OnAutocomplete("poll", "poll")
  async onAutocompletePoll(
    @DC.Interaction auto: AutocompleteInteraction,
    @DC.Option.FocusedValue value: string,
  ) {
    const options = await this.repo.find({
      where: {
        closed: false,
        title: Safe.ILike(`:value%`, { value }),
        guild: { discordId: auto.guildId },
      },
      order: { title: "DESC" },
    });
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
    await this.createPoll(cmd.guildId, pollOptions as FullPollOptions);
  }

  @OnChatCommand("poll", "edit")
  async onCommandPollEdit(
    @DC.Interaction cmd: ChatInputCommandInteraction,
    @DC.Option.Value("poll") pollId: string,
    @DC.Option.Value("title") title?: string,
    @DC.Option.Value("desc") desc?: string,
    @DC.Option.Value("options") options?: string,
  ) {
    const poll = await this.repo.findOne({ where: { id: pollId } });
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
    await this.repo.save(poll);
  }

  @OnChatCommand("poll", "abort")
  async onPollAbort(
    @DC.Interaction cmd: ChatInputCommandInteraction,
    @DC.Option.Value("poll") pollId: string,
  ) {
    await cmd.deferReply({ ephemeral: true });
    await this.cancelPollSchedule(pollId);
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ closed: true })
      .where(":pollId = id", { pollId })
      .execute();
  }

  @OnChatCommand("poll", "reset")
  async onPollReset(
    @DC.Interaction cmd: ChatInputCommandInteraction,
    @DC.Option.Value("poll") pollId: string,
  ) {
    await cmd.deferReply({ ephemeral: true });
    await this.repo
      .createQueryBuilder()
      .update()
      .set({
        results: {},
        counts: {},
        closed: false,
      })
      .where(":pollId = id", { pollId })
      .execute();
  }

  @OnChatCommand("poll", "conclude")
  async onPollConclude(
    @DC.Interaction cmd: ChatInputCommandInteraction,
    @DC.Option.Value("poll") pollId: string,
  ) {
    await cmd.deferReply({ ephemeral: true });
    await this.cancelPollSchedule(pollId);
    await this.concludePoll(pollId);
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
    await this.repo
      .createQueryBuilder()
      .update()
      .set({
        title,
        description: desc,
        options: [...new Set(options)],
        counts: {},
      })
      .where(":pollId = id", { pollId })
      .execute();
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
    const result = await this.togglePoll(
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

  async createPoll(guildId: string, options: FullPollOptions) {
    const normalised = [
      ...new Set(options.options.map(it => it.trim()).filter(it => it)),
    ];
    const server = await getServer(guildId);
    const poll = this.repo.create({
      title: options.title,
      options: normalised,
      channelId: options.channelId,
      conclusion: new Date(Date.now() + options.timeframe),
      description: options.desc,
      single: !options.multiple,
      counts: {},
      results: {},
      guild: server,
    });
    await this.repo.save(poll);
    const message = await this.createPollMessage(poll);
    poll.messageId = message.id;
    await this.repo.save(poll);
    await this.schedulePoll(poll.id, poll.conclusion);
    return poll;
  }

  async createPollMessage(poll: Poll) {
    const channel = await this.getPollChannel(poll);
    if (!channel.isTextBased()) return;
    return channel.send({
      embeds: [this.createPollEmbed(poll)],
      components: this.createPollComponents(poll),
    });
  }

  async updatePollMessage(poll: Poll) {
    const message = await this.getPollMessage(poll);
    await message.edit({
      embeds: [this.createPollEmbed(poll)],
      components: poll.closed ? [] : this.createPollComponents(poll),
      files: poll.closed ? [await this.createPollResultAttachment(poll)] : [],
    });
  }

  async getPollChannel(poll: Poll) {
    const guild = await getSingleCached(discord.guilds, poll.guild.discordId);
    return (await getSingleCached(
      guild.channels,
      poll.channelId,
    )) as GuildTextBasedChannel;
  }

  async getPollMessage(poll: Poll) {
    const channel = await this.getPollChannel(poll);
    return await getSingleCached(channel.messages, poll.messageId);
  }

  createPollEmbed(poll: Poll) {
    return (
      <embed
        title={t.ui.header.replaceAll("{{text}}", poll.title)}
        description={poll.description}
        fields={[
          <field
            name={poll.closed ? t.ui.closed : t.ui.open}
            value={`<t:${(+poll.conclusion / 1000) | 0}:R>`}
          />,
        ]}
      />
    );
  }

  async createPollResultAttachment(poll: Poll) {
    let labels = Object.keys(poll.results);
    let data = Object.values(poll.results) as number[];
    if (labels.length > 12) {
      labels = labels.slice(0, 11).concat("Andere");
      data = data.slice(0, 11).concat(data.slice(11).reduce((a, b) => a + b));
    }

    return await this.chart.renderToBuffer({
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            label: t.ui.results,
            data,
            backgroundColor: [
              "#84cc16",
              "#14b8a6",
              "#3b82f6",
              "#a855f7",
              "#f43f5e",
              "#f59e0b",
              "#10b981",
              "#0ea5e9",
              "#8b5cf6",
              "#ec4899",
              "#ef4444",
              "#22c55e",
            ],
          },
        ],
      },
    });
  }

  createPollComponents(poll: Poll) {
    return chunks(
      poll.options.map(option => (
        <button
          style={ButtonStyle.Secondary}
          label={option}
          customId={`poll:select:${poll.id}:${option.replaceAll(":", "🤡")}`}
        />
      )),
      5,
    ).map(row => <actionRow>{row}</actionRow>);
  }

  async schedulePoll(id: string, conclusion: Date) {
    if (conclusion <= new Date()) await this.concludePoll(id);
    else
      this.scheduled[id] = setTimeout(async () => {
        try {
          await this.concludePoll(id);
        } catch (e) {
          console.error(e);
        }
      }, +conclusion - +new Date()) as any;
  }

  async cancelPollSchedule(id: string) {
    if (this.scheduled[id]) clearTimeout(this.scheduled[id]);
  }

  async concludePoll(id: string) {
    const poll = await this.repo.findOne({
      where: { id },
      relations: ["guild"],
    });
    poll.closed = true;
    poll.results = poll.single
      ? this.singleChoiceResults(poll as any)
      : this.multipleChoiceResults(poll as any);
    poll.results = Object.fromEntries(
      Object.entries(poll.results).sort(([, a], [, b]) => b - a),
    );
    await this.updatePollMessage(poll);
    this.repo.save(poll);
  }

  singleChoiceResults(poll: Poll & { single: true }) {
    const results: Record<string, number> = {};
    for (const choice of Object.values(poll.counts)) {
      if (results[choice] == null) results[choice] = 1;
      else results[choice]++;
    }
    return results;
  }

  multipleChoiceResults(poll: Poll & { single: false }) {
    const results: Record<string, number> = {};
    for (const choices of Object.values(poll.counts)) {
      for (const choice of choices) {
        if (results[choice] == null) results[choice] = 1;
        else results[choice]++;
      }
    }
    return results;
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
