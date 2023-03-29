import {
  DiscordHandlerMeta,
  getDiscordMeta,
  createLastFilter,
  DiscordHandlerParams,
} from "src/util";

export const OnVoiceStateUpdate = basicDecorator("voiceStateUpdate");

export const OnMemberJoin = basicDecorator("memberJoin");
export const OnMemberLeave = basicDecorator("memberLeave");
export const OnMemberUpdate = basicDecorator("memberUpdate");

export const OnRoleCreate = basicDecorator("roleCreate");
export const OnRoleDelete = basicDecorator("roleDelete");
export const OnRoleUpdate = basicDecorator("roleUpdate");

export const OnMessageCreate = basicDecorator("messageCreate");
export const OnMessageDelete = basicDecorator("messageDelete");
export const OnMessageUpdate = basicDecorator("messageUpdate");

export const OnBanCreate = basicDecorator("banCreate");
export const OnBanRemove = basicDecorator("banRemove");

export const OnInit = basicDecorator("init");

function basicDecorator<Field extends keyof DiscordHandlerMeta>(field: Field) {
  const next = createLastFilter();
  return function (
    proto: any,
    name: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    desc: TypedPropertyDescriptor<
      (...params: DiscordHandlerParams<Field>) => any
    >,
  ) {
    getDiscordMeta(proto.constructor).handlers[field].push(async function ({
      params,
      context,
    }) {
      const first = params.length >= 1 ? params[0] : undefined;
      if (
        first &&
        typeof first === "object" &&
        ("id" in first ? !next(first["id"]) : !next(first))
      )
        return;
      return context[name].call(this, ...params);
    });
  };
}
