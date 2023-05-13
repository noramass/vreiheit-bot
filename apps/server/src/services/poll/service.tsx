import { Service } from "@propero/easy-api";
import { Poll, dataSource, defineProcedure, Safe } from "@vreiheit/database";
import { chunks } from "@vreiheit/util";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { ButtonStyle, GuildTextBasedChannel } from "discord.js";
import { Injectable } from "src/mount";
import t from "src/services/poll/translations.json";
import { getServer } from "src/util";
import { Repository } from "typeorm";
import {
  discord,
  DiscordElements as React,
  getSingleCached,
} from "@vreiheit/discord";

export interface PollOptions {
  channelId: string;
  timeframe: number;
  multiple: boolean;
  options: string[];
  pollId?: string;
  title?: string;
  desc?: string;
}

export type FullPollOptions = Required<PollOptions>;

@Injectable()
export class PollService {
  get repo(): Repository<Poll> {
    return dataSource.getRepository(Poll);
  }
  scheduled: Record<string, number> = {};

  chart = new ChartJSNodeCanvas({
    width: 400,
    height: 400,
    backgroundColour: "transparent",
  });

  togglePoll = defineProcedure<[string, string, string], boolean>(
    "toggle_poll_choice",
  );

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

  abortPoll(pollId: string) {
    return this.repo
      .createQueryBuilder()
      .update()
      .set({ closed: true })
      .where(":pollId = id", { pollId })
      .execute();
  }

  resetPoll(pollId: string) {
    return this.repo
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

  editPoll(
    pollId: string,
    title: string,
    description: string,
    options: string[],
  ) {
    return this.repo
      .createQueryBuilder()
      .update()
      .set({
        title,
        description: description,
        options: [...new Set(options)],
        counts: {},
      })
      .where(":pollId = id", { pollId })
      .execute();
  }

  update(poll: Poll) {
    return this.repo.save(poll);
  }

  getAll() {
    return this.repo.find({ relations: ["guild"] });
  }

  findByTitle(guildId: string, value: string) {
    return this.repo.find({
      where: {
        closed: false,
        title: Safe.ILike(`:value%`, { value }),
        guild: { discordId: guildId },
      },
      order: { title: "DESC" },
    });
  }

  findById(pollId: string) {
    return this.repo.findOne({ where: { id: pollId } });
  }

  async createPollMessage(poll: Poll) {
    const channel = await this.getPollChannel(poll);
    if (!channel.isTextBased()) return;
    return channel.send({
      embeds: [this.createPollEmbed(poll)],
      components: this.createPollComponents(poll),
    });
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
    await this.repo.save(poll);
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

  async updatePollMessage(poll: Poll) {
    const message = await this.getPollMessage(poll);
    await message.edit({
      embeds: [this.createPollEmbed(poll)],
      components: poll.closed ? [] : this.createPollComponents(poll),
      files: poll.closed ? [await this.createPollResultAttachment(poll)] : [],
    });
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

  async getPollChannel(poll: Poll) {
    const guild = await getSingleCached(discord.guilds, poll.guild.discordId);
    return (await getSingleCached(
      guild.channels,
      poll.channelId,
    )) as GuildTextBasedChannel;
  }
}
