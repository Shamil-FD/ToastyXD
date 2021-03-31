const { warn, warnCount } = require("../../Util/Models");
const Command = require("../../Util/Command.js");
const moment = require("moment");

module.exports = class VerbalWarnCommand extends Command {
  constructor() {
    super("verbalwarn", {
      aliases: ["verbalwarn", "vb"],
      category: "Staff",
      channel: "guild",
      staffOnly: true,
      args: [
        { id: "user", type: "memberMention" },
        { id: "reason", match: "rest" },
      ],
    });
  }

  async exec(message, { user, reason }) {
    let client = this.client;
    if (!user)
      return message.send(this.client.embed().setDescription("You can't warn anybody without providing me an user."));
    if (!reason)
      return message.send(this.client.embed().setDescription("You can't warn someone without a valid reason."));
    if (user.id === message.member.id)
      return message.send(this.client.embed().setDescription("You can't warn yourself!"));
    if (user.user.bot) return message.send(this.client.embed().setDescription("You can't warn one of my kind."));
    message.delete();

    async function WarnAndReport() {
      let doc = await warnCount.findOne();
      if (!doc) await new warnCount({ num: 1 }).save();
      else if (doc) {
        doc.num++;
        doc.save();
      }

      await new warn({
        mod: message.author.tag,
        user: user.id,
        reason: reason,
        id: doc.num,
        date: moment().format("ll"),
      }).save();

      await message.guild.channels.cache.get(client.config.StaffReportChnl).send(
        client
          .embed()
          .setAuthor(`${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
          .addField("> **Victim**:", `${user} | ${user.id}`, true)
          .addField("> **Reason**:", reason)
          .setFooter(`Case ID: ${doc.num}`)
      );
      return message.channel.send(
        user,
        client
          .embed()
          .setDescription("<@" + user + "> were **__verbally warned__** for **" + reason + "**")
          .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
      );
    }

    let docs = await warn.find({ user: user.id });

    if (docs.length) {
      let str = await docs
        .map(
          d =>
            `${this.client.arrow} **Case ID**: ${d.id}\n${this.client.arrow} **Moderator**: ${d.mod}\n${
              this.client.arrow
            } **Reason**: ${d.reason}\n${this.client.arrow} **Date**: ${d.date ? d.date : "No logged date"}\n`
        )
        .join("\n");

      let msgs = [];
      let splitted = await client.split(str);
      if (splitted.length == 1) {
        await message
          .send({
            embeds: {
              description: splitted[0],
              author: {
                text: `Past warns of ${user.user.username}`,
                url: user.user.displayAvatarURL({ dynamic: true }),
              },
            },
          })
          .then(m => msgs.push(m.id));
      } else {
        for (let i = 0; i < splitted.length; i++) {
          await message
            .send({
              embeds: {
                description: splitted[i],
                author: {
                  text: `Past warns of ${user.user.username}`,
                  url: user.user.displayAvatarURL({ dynamic: true }),
                },
              },
            })
            .then(m => msgs.push(m.id));
        }
      }

      let msg = await message.send({
        embeds: {
          description: `Do you really want to warn ${user} for \`${reason}\`?`,
          author: { text: message.author.username, url: message.author.displayAvatarURL({ dynamic: true }) },
        },
      });
      await msg.react(this.client.tick);
      await msg.react(this.client.cross);
      try {
        let collected = await msg.awaitReactions((reaction, u) => u.id === message.author.id, {
          max: 1,
          time: 15000,
          errors: ["time"],
        });

        if (collected.first().emoji.name === this.client.tick) {
          (await msg.deleted) ? null : msg.delete();
          await msgs.forEach(async m => {
            await message.channel.messages.fetch(m).then(mm => mm.delete());
          });
          return WarnAndReport();
        } else if (collected.first().emoji.name === this.client.cross) {
          (await msg.deleted) ? null : msg.delete();
          await msgs.forEach(async m => {
            await message.channel.messages.fetch(m).then(mm => mm.delete());
          });
          return message.send({ embeds: { description: "Verbal Warn cancelled.", color: "GREEN" } });
        } else return message.send({ embeds: { description: "Verbal Warn cancelled.", color: "RED" } });
      } catch (e) {
        (await msg.deleted) ? null : msg.delete();
        await msgs.forEach(async m => {
          await message.channel.messages.fetch(m).then(mm => mm.delete());
        });
        return message.send({ embeds: { description: "I waited long enough. Verbal Warn cancelled.", color: "RED" } });
      }
    } else return WarnAndReport();
  }
};
