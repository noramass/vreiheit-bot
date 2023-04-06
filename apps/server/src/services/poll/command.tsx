import { DiscordElements as React, JSX } from "@vreiheit/discord";
import { ChannelType } from "discord.js";
import { lang } from "src/consts";
import t from "./translations.json";

function SubCommand({
  name: cmd,
  children,
}: {
  name: keyof (typeof t)["subCommands"];
  children?: any;
}) {
  const { name, desc } = t.subCommands[cmd];
  return (
    <subCommand
      name={name[lang]}
      nameLocalizations={name}
      description={desc[lang]}
      descriptionLocalizations={desc}>
      {children}
    </subCommand>
  );
}

function Option({
  name: option,
  children,
  required,
  autocomplete,
  type = "string",
  ...options
}: {
  name: keyof (typeof t)["options"];
  children?: any[];
  autocomplete?: boolean;
} & Partial<JSX.JsxSlashCommandOptionProps>) {
  const { name, desc } = t.options[option];
  return (
    <commandOption
      type={type}
      name={name[lang]}
      nameLocalizations={name}
      description={desc[lang]}
      descriptionLocalizations={desc}
      autocomplete={autocomplete}
      required={required}
      {...options}>
      {children}
    </commandOption>
  );
}

function PollOption({ autocomplete = true }: { autocomplete?: boolean }) {
  return <Option name="poll" required autocomplete={autocomplete} />;
}

function OptionsOption() {
  return <Option name="options" />;
}

function TitleOption() {
  return <Option name="title" />;
}

function DescOption() {
  return <Option name="desc" />;
}

function TimeframeOption() {
  return <Option name="timeframe" type="number" autocomplete={true} />;
}

function MultipleChoiceOption() {
  return <Option name="multipleChoice" type="boolean" />;
}

function ChannelOption() {
  return (
    <Option
      name="channel"
      type="channel"
      channelTypes={[
        ChannelType.PublicThread,
        ChannelType.AnnouncementThread,
        ChannelType.PrivateThread,
        ChannelType.GuildText,
        ChannelType.GuildNews,
      ]}
    />
  );
}

export function pollCommand() {
  return (
    <slashCommand
      name={t.name[lang]}
      nameLocalizations={t.name}
      description={t.desc[lang]}
      descriptionLocalizations={t.desc}>
      <SubCommand name="create">
        <TitleOption />
        <DescOption />
        <OptionsOption />
        <TimeframeOption />
        <ChannelOption />
        <MultipleChoiceOption />
      </SubCommand>
      <SubCommand name="edit">
        <PollOption />
        <TitleOption />
        <DescOption />
        <OptionsOption />
        <TimeframeOption />
      </SubCommand>
      <SubCommand name="abort">
        <PollOption />
      </SubCommand>
      <SubCommand name="reset">
        <PollOption />
      </SubCommand>
      <SubCommand name="conclude">
        <PollOption />
      </SubCommand>
    </slashCommand>
  );
}
