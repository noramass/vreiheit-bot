import { Get, Param, Service } from "@propero/easy-api";
import { Server } from "@vreiheit/database";
import { UserGuilds } from "src/decorators/user-guilds";
import { ManagedMessageService } from "src/services";

@Service("/managed-message")
export class ManageMessageHttpController {
  messageService!: ManagedMessageService;

  @Get("/:guildId?")
  async list(
    @UserGuilds userGuilds: Server[],
    @Param("guildId") guildId?: string,
  ) {
    const [items, count] = await this.messageService.findAndCountByGuildId(
      guildId,
    );
    return {
      data: {
        items,
        count,
      },
    };
  }
}
