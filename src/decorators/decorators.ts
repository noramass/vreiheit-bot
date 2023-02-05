import { DiscordHandlerMeta, getHandlerMeta } from "src/decorators/meta";
export function OnInteraction(interactionId: string) {
  return createHandlerDecorator("interaction", interactionId);
}

export function OnButton(buttonId: string) {
  return createHandlerDecorator("button", buttonId);
}

export function OnCommand(commandId: string) {
  return createHandlerDecorator("command", commandId);
}

export function OnFormSubmit(formId: string) {
  return createHandlerDecorator("form", formId);
}

export function OnMemberJoin() {
  return createHandlerDecorator("memberJoin");
}

export function OnMemberLeave() {
  return createHandlerDecorator("memberLeave");
}

export function OnMessage() {
  return createHandlerDecorator("message");
}

export function createHandlerDecorator(
  field: keyof DiscordHandlerMeta,
  id?: string,
) {
  return function (proto: any, name: string | symbol) {
    getHandlerMeta(proto.constructor, field as any, id ?? "").push(proto[name]);
  };
}

export function OnInit() {
  return createHandlerDecorator("init");
}
