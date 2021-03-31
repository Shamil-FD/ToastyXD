const { Listener } = require("discord-akairo");
const blacklisted = require("../Util/Models").blacklist;
const _ = require("lodash");
const moment = require("moment");
const { Util } = require("discord.js");

module.exports = class BlackListListener extends Listener {
  constructor() {
    super("blacklist", {
      emitter: "client",
      event: "message",
    });
  }

  async exec(message) {
    if (message.author.bot === true) return;
    if (message.channel.type !== "text") return;
    let { member, author, guild, content } = message;
    content = await Util.escapeMarkdown(content);
    content = await content.replace(/`/g, "");
    // Blacklisted Word Detector ( Not The Best )
    let doc = await blacklisted.find();
    let newContent;
    let docs;
    doc = await doc.filter(documents => documents.wild === true);

    for (let o = 0; o < doc.length; o++) {
      let regex = new RegExp(doc[o].word, "gi");
      newContent = await content.match(regex);
      newContent = await _.compact(newContent);
      if (newContent.length) {
        docs = doc[o];
        break;
      }
    }
    if (!newContent || !newContent.length) {
      newContent = content.toLowerCase().split(" ");
      newContent = await _.compact(newContent);
      if (newContent.length) {
        for (let i = 0; i < newContent.length; i++) {
          docs = await blacklisted.findOne({ word: newContent });
          if (docs) {
            break;
          }
        }
      }
    }
    if (docs) {
      if (message.member.roles.cache.get(this.client.config.StaffRole)) return;
      let action = docs.action;
      message.delete();
      let embed = this.client
        .embed()
        .setAuthor("Blacklisted Word Detected!", this.client.user.displayAvatarURL())
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
      let ReportChnl = await message.guild.channels.cache.get(this.client.config.StaffReportChnl);

      if (action === "delete") {
        return ReportChnl.send(
          embed.setDescription(
            `${this.client.arrow} **User**: ${message.author} || ${message.author.id}\n${this.client.arrow} **Message**: \`${message.content}\`\n${this.client.arrow} **Blacklisted Word**: \`${docs.word}\`\n${this.client.arrow} **Channel**: ${message.channel}`
          )
        ).catch(() => {});
      } else if (action === "warn") {
        await message.author
          .send(
            this.client
              .embed()
              .setDescription(`Please do not use ${docs.word} in your messages. You have been verbally warned.`)
              .setFooter("Salvage's Oasis", message.guild.iconURL({ dynamic: true }))
              .setTitle("Message Deleted.")
          )
          .catch(() => {
            message.reply(`Please do not use ${docs.word} in your messages. You have been verbally warned.`);
          });

        await new this.client.models.warn({
          user: message.author.tag,
          id: message.author.id,
          mod: "Toasty XD Auto-Mod",
          reason: "Usage of a blacklisted word.",
          date: moment().format("LL"),
        }).save();
        return ReportChnl.send(
          embed
            .setDescription(
              `${this.client.arrow} **User**: ${message.author} || ${message.author.id}\n${this.client.arrow} **Message**: \`${message.content}\`\n${this.client.arrow} **Blacklisted Word**: \`${docs.word}\`\n${this.client.arrow} **Channel**: ${message.channel}`
            )
            .setTitle("Verbal Warn")
        ).catch(() => {});
      } else if (action === "kick") {
        await message.author
          .send(
            embed.setDescription(
              `You have been kicked from ${message.guild.name} due to the usage of the word ${docs.word} in your message`
            )
          )
          .catch(async () => {
            await message.member.kick();
            return ReportChnl.send(
              embed
                .setDescription(
                  `${this.client.arrow} **User**: ${message.author.tag} || ${message.author.id}\n${this.client.arrow} **Message**: \`${message.content}\`\n${this.client.arrow} **Blacklisted Word**: \`${docs.word}\`\n${this.client.arrow} **Channel**: ${message.channel}`
                )
                .setTitle("Kicked a Member")
                .setFooter("I couldn't dm them")
            ).catch(() => {});
          });

        await message.member.kick();
        return ReportChnl.send(
          embed
            .setDescription(
              `${this.client.arrow} **User**: ${message.author.tag} || ${message.author.id}\n${this.client.arrow} **Message**: \`${message.content}\`\n${this.client.arrow} **Blacklisted Word**: \`${docs.word}\`\n${this.client.arrow} **Channel**: ${message.channel}`
            )
            .setFooter("I dm'd them")
            .setTitle("Kicked a Member")
        ).catch(() => {});
      } else if (action === "ban") {
        await message.author
          .send(
            embed.setDescription(
              `You have been banned from ${message.guild.name} due to the usage of the word ${docs.word} in your message\nJoin https://discord.gg/Xbbp7N87dM for a chance to get unbanned by submitting an appeal.`
            )
          )
          .catch(async () => {
            await message.member.ban();
            return ReportChnl.send(
              embed
                .setDescription(
                  `${this.client.arrow} **User**: ${message.author.tag} || ${message.author.id}\n${this.client.arrow} **Message**: \`${message.content}\`\n${this.client.arrow} **Blacklisted Word**: \`${docs.word}\`\n**Channel**: ${message.channel}`
                )
                .setFooter("I couldn't dm them")
                .setTitle("Banned a Member")
            ).catch(() => {});
          });

        await message.member.ban();
        return ReportChnl.send(
          embed
            .setDescription(
              `${this.client.arrow} **User**: ${message.author.tag} || ${message.author.id}\n${this.client.arrow} **Message**: \`${message.content}\`\n${this.client.arrow} **Blacklisted Word**: \`${docs.word}\`\n**Channel**: ${message.channel}`
            )
            .setTitle("Banned a Member")
            .setFooter("I dm'd them")
        ).catch(() => {});
      }
    }
  }
};
