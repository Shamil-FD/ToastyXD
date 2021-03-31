const Command = require("../../../Util/Command");

module.exports = class BlacklistCommand extends Command {
  constructor() {
    super("blacklist-add", {
      category: "Staff",
      channel: "guild",
      staffOnly: true,
      args: [
        { id: "wild", match: "flag", flag: "wild" },
        { id: "action", type: ["delete", "warn", "kick", "ban"] },
        { id: "word", match: "rest" },
      ],
    });
  }
  async exec(message, { wild, action, word }) {
    let { models, arrow } = this.client;
    if (!word || !action)
      return message.send(message.author, {
        embeds: {
          description: `Proper Usage: ${arrow} \`t)blacklist add <wild> [Action = ban, kick, delete, warn] [Word]\``,
          color: "RED",
        },
      });

    let doc = await models.blacklist.findOne({ word: word.toLowerCase() });
    if (doc)
      return message.send(message.author, {
        embeds: { color: "RED", description: `${arrow} That word is already blacklisted.` },
      });
    await new models.blacklist({
      word: word.toLowerCase(),
      action: action.toLowerCase(),
      wild: wild ? true : false,
    }).save();
    message.send(message.author, { embeds: { color: "GREEN", description: `${arrow} Successfully saved.` } });
    message.delete();
  }
};
