const { Listener } = require("discord-akairo");

module.exports = class GuildMemberRemoveListener extends Listener {
  constructor() {
    super("guildMemberRemove", {
      emitter: "client",
      event: "guildMemberRemove",
    });
  }

  async exec(member) {
    // Remove First Time In Help Channel Thing
    if (this.client.firstTime.has(member.id)) {
      return this.client.firstTime.delete(member.id);
    }
  }
};
