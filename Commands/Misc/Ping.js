const Command = require("../../Util/Command.js");
const { MessageEmbed } = require("discord.js");

module.exports = class PingCommand extends Command {
  constructor() {
    super("ping", {
      aliases: ["ping"],
      category: "misc",
    });
  }

  async exec(message) {
    message.send(new MessageEmbed().setDescription("Pong!").successColor()).then(m =>
      m.edit(
        new MessageEmbed()
          .setDescription(
            `Message roundtrip: ${m.createdTimestamp - message.createdTimestamp}MS\nAPI: ${Math.round(
              this.client.ws.ping
            )}MS`
          )
          .successColor()
          .setFooter("Miss you <3", this.client.user.displayAvatarURL())
      )
    );
  }
};
