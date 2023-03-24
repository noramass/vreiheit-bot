import { Service } from "@propero/easy-api";
import { OnInit } from "@vreiheit/discord";
import { Client, PermissionsBitField } from "discord.js";

@Service("/manage-message")
export class ManagedMessageService {
  @OnInit
  async onInit(client: Client<true>) {
    console.log(
      client.generateInvite({
        permissions: [PermissionsBitField.All],
        scopes: [],
      }),
    );
  }
}
