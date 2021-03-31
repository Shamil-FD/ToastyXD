const Command = require("../../Util/Command.js");
const { warn } = require("../../Util/Models");
const moment = require("moment");

module.exports = class CaseCommand extends Command {
  constructor() {
    super("case", {
      aliases: ["case"],
      category: "Staff",
      channel: "guild",
      staffOnly: true,
      args: [{ id: "id", type: "number" }],
    });
  }

  async exec(message, { id }) {
    if (!id || id.isNaN) return message.send({ embeds: { description: "No Case ID = No Case Info", color: "RED" } });

    let doc = await warn.findOne({ id: id });
    if (!doc) return message.send({ embeds: { color: "RED", description: `Case ID: ${id} doesn't exist!` } });

    return message.channel.send(
      this.client
        .embed()
        .addField(this.client.arrow + " Case Mod:", doc.mod)
        .addField(this.client.arrow + " Case Victim:", doc.user, true)
        .addField(this.client.arrow + " Case Reason:", doc.reason, true)
        .addField(this.client.arrow + " Case Date:", doc.date)
    );
  }
};
