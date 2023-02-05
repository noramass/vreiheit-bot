import { register } from "src/commands/registry";
import {
  demote,
  getHierarchy,
  isAbove,
  promote,
} from "src/roles/hierachy/hierachy";

register("promote", async message => {
  const self = message.member;
  const target = message.mentions.members.first();
  if (!target || target.id === self.id) return;
  const hierarchy = await getHierarchy(message.guild);
  if (await isAbove(self, target, hierarchy))
    await promote(target, undefined, hierarchy);
});

register("demote", async message => {
  const self = message.member;
  const target = message.mentions.members.first();
  if (!target || target.id === self.id) return;
  const hierarchy = await getHierarchy(message.guild);
  if (await isAbove(self, target, hierarchy))
    await demote(target, undefined, hierarchy);
});
