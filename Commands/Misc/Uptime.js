const Command = require("../../Util/Command.js");
const ms = require("pretty-ms");

module.exports = class UptimeCommand extends Command {
  constructor() {
    super("uptime", {
      aliases: ["uptime"],
      category: "misc",
    });
  }

  async exec(message) {
    return message.send({
      embeds: {
        description: `Uptime: ${ms(this.client.uptime)}\nMemory Usage: ${
          Math.trunc(process.memoryUsage().heapUsed / 1024 / 1000) + "mb"
        }`,
      },
    });
  }
};
