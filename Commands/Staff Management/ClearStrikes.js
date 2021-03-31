const Command = require("../../Util/Command.js");

module.exports = class ResetStrikesCommand extends Command {
  constructor() {
    super("resetstrikes", {
      aliases: ["resetstrikes", "resetstrike"],
      category: "Staff Management",
      channel: "guild",
      managerOnly: true,
      args: [{ id: "user", match: "rest" }],
    });
  }

  async exec(message, { user }) {
    let { staff } = this.client.models;
    user = await message.getMember(user);
    if (!user) return message.reply(this.client.embed().setDescription("Invalid user!"));

    let doc = await staff.findOne({ user: user.id });
    if (!doc) return message.reply(this.client.embed().setDescription("They don't have any strikes."));

    doc.strikes = 0;
    await doc.save();
    return message.reply(this.client.embed().setDescription("POOF! Begone strikes!"));
  }
};
