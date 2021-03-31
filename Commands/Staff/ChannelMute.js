const Command = require("../../Util/Command.js");
const { chnlmute } = require("../../Util/Models.js");
const ms = require("ms");

module.exports = class ChannelMuteCommand extends Command {
  constructor() {
    super("channelmute", {
      aliases: ["channelmute", "cm"],
      category: "Staff",
      channel: "guild",
      staffOnly: true,
      args: [{ id: "user", type: "memberMention" }, { id: "time" }, { id: "reason", match: "rest" }],
    });
  }

  async exec(message, { user, time, reason }) {
    let client = this.client;

    if (!user)
      return message.send(client.embed().setDescription("Proper usage: `t)channelmute @User [5m | 5h | 5d] [reason]`"));

    if (!time)
      return message.send(client.embed().setDescription("Proper usage: `t)channelmute @User [5m | 5h | 5d] [reason]`"));
    if (!reason) return message.send(client.embed().setDescription("No reason = No mute dum dum"));

    let doc = await chnlmute.findOne({
      user: user.id,
      chnl: message.channel.id,
    });
    if (doc) return message.send(client.embed().setDescription("They are already muted"));

    time = ms(time);
    if (!time)
      return message.send(client.embed().setDescription("Proper usage: `t)channelmute @User [5m | 5h | 5d] [reason]`"));

    await new chnlmute({
      user: user.id,
      chnl: message.channel.id,
      time: time,
      date: Date.now(),
      reason: reason,
      mod: message.author.tag,
    }).save();
    await message.channel.createOverwrite(user, {
      SEND_MESSAGES: false,
      ADD_REACTIONS: false,
    });

    message.send(
      client
        .embed()
        .setDescription(`${this.client.arrow} Muted ${user} in this channel for ${time}\nReason: ${reason}`)
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
    );

    message.guild.channels.cache.get(this.client.config.StaffReportChnl).send(
      client
        .embed()
        .setTitle("Muted")
        .setAuthor(
          `${this.client.arrow} Moderator: ${message.author.username}`,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .addField(this.client.arrow + " **Victim**:", `${user} || ${user.id}`, true)
        .addField(this.client.arrow + " **Reason**:", reason, true)
        .addField(this.client.arrow + " **Duration**:", time, true)
        .addField(this.client.arrow + "**Channel**:", message.channel, true)
    );
  }
};
