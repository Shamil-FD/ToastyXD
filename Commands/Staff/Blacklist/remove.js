const { Flag } = require("discord-akairo");
const Command = require("../../../Util/Command");

module.exports = class BlacklistCommand extends Command {
  constructor() {
    super("blacklist-remove", {
      category: "Staff",
      channel: "guild",
      staffOnly: true,
      args: [{ id: "word", match: "content" }],
    });
  }
  async exec(message, { word }) {
    let { models, arrow } = this.client;
    if (!word)
      return message.send(message.author, {
        embeds: { color: "RED", description: `Proper Usage: ${arrow} \`t)blacklist remove [Word]\`` },
      });

    let doc = await models.blacklist.findOne({ word: word.toLowerCase() });
    if (!doc)
      return message.send(message.author, {
        embeds: { color: "RED", description: `${arrow} That word is not blacklisted.` },
      });
    await doc.delete();
    message.send(message.author, { embeds: { color: "RED", description: "Removed that word." } });
    await message.delete();
  }
};
