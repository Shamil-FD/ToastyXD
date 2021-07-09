const _ = require('lodash');
const moment = require('moment');
const { Util } = require('discord.js');
const { Listener } = require('discord-akairo');
const blacklisted = require('../Util/Models').blacklist;

module.exports = class MessageUpdateListener extends Listener {
  constructor() {
    super('messageUpdate', {
      emitter: 'client',
      event: 'messageUpdate',
    });
  }

  async exec(Old, New) {
    // Check if testMode is turned on
    if (this.client.config.testMode === true) return;
    if (Old.guild.id !== '655109296400367618') return;
    // This File Is For Checking If a Message That's Been Edited Has A Blacklisted Word.
    New = await New.fetch().catch((error) => {
      return console.log('Something went wrong when fetching the message: ', error);
    });
    if (!New) return;
    if (New.deleted === true) return;
    if (New.channel.type !== 'GUILD_TEXT') return;
    if (New.author.bot === true) return;
    let { member, author, guild, content } = New;
    content = await Util.escapeMarkdown(content);
    content = await content.replace(/`/g, '');

    // Blacklisted Word Detector ( Not The Best )
    let doc = await blacklisted.find();
    let newContent;
    let docs;
    doc = await doc.filter((documents) => documents.wild === true);

    for (let o = 0; o < doc.length; o++) {
      let regex = new RegExp(doc[o].word, 'gi');
      newContent = await content.match(regex);
      newContent = await _.compact(newContent);
      if (newContent.length) {
        docs = doc[o];
        break;
      }
    }
    if (!newContent.length) {
      newContent = content.toLowerCase().split(' ');
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
      let action = docs.action;
      New.delete();
      let embed = this.client.tools
        .embed()
        .setAuthor('Blacklisted Word Detected!', this.client.user.displayAvatarURL())
        .setThumbnail(New.author.displayAvatarURL({ dynamic: true }));
      let ReportChnl = await New.guild.channels.cache.get(this.client.config.StaffReportChnl);

      if (action === 'delete')
        return ReportChnl.send({
          embeds: [
            embed.setDescription(
              `${this.client.config.arrow} **User**: ${New.author} || ${New.author.id}\n${this.client.config.arrow} **Message**: \`${New.content}\`\n${this.client.config.arrow} **Blacklisted Word**: \`${docs.word}\`\n${this.client.config.arrow} **Channel**: ${New.channel}`,
            ),
          ],
        }).catch(() => {});
      else if (action === 'warn') {
        await New.author
          .send({
            embeds: [
              this.client.tools
                .embed()
                .setDescription(`Please do not use ${docs.word} in your messages. You have been warned.`)
                .setFooter("Salvage's Squad", New.guild.iconURL({ dynamic: true }))
                .setTitle('Message Deleted.'),
            ],
          })
          .catch(() => {
            New.reply(`Please do not use ${docs.word} in your messages. You have been warned.`);
          });

        return ReportChnl.send({
          embeds: [
            embed
              .setDescription(
                `${this.client.config.arrow} **User**: ${New.author} || ${New.author.id}\n${this.client.config.arrow} **Message**: \`${New.content}\`\n${this.client.config.arrow} **Blacklisted Word**: \`${docs.word}\`\n${this.client.config.arrow} **Channel**: ${New.channel}`,
              )
              .setTitle('Verbal Warn'),
          ],
        }).catch(() => {});
      } else if (action === 'kick') {
        await New.author
          .send({
            embeds: [
              embed.setDescription(
                `You have been kicked from ${New.guild.name} due to the usage of the word ${docs.word} in your message`,
              ),
            ],
          })
          .catch(async () => {
            await New.member.kick();
            return ReportChnl.send({
              embeds: [
                embed
                  .setDescription(
                    `${this.client.config.arrow} **User**: ${New.author.tag} || ${New.author.id}\n${this.client.config.arrow} **Message**: \`${New.content}\`\n${this.client.config.arrow} **Blacklisted Word**: \`${docs.word}\`\n${this.client.config.arrow} **Channel**: ${New.channel}`,
                  )
                  .setTitle('Kicked a Member')
                  .setFooter("I couldn't dm them"),
              ],
            }).catch(() => {});
          });

        await New.member.kick();
        return ReportChnl.send({
          embeds: [
            embed
              .setDescription(
                `${this.client.config.arrow} **User**: ${New.author.tag} || ${New.author.id}\n${this.client.config.arrow} **Message**: \`${New.content}\`\n${this.client.config.arrow} **Blacklisted Word**: \`${docs.word}\`\n${this.client.config.arrow} **Channel**: ${New.channel}`,
              )
              .setFooter("I dm'd them")
              .setTitle('Kicked a Member'),
          ],
        }).catch(() => {});
      } else if (action === 'ban') {
        await New.author
          .send({
            embeds: [
              embed.setDescription(
                `You have been banned from ${New.guild.name} due to the usage of the word ${docs.word} in your message\nJoin https://discord.gg/Xbbp7N87dM for a chance to get unbanned by submitting an appeal.`,
              ),
            ],
          })
          .catch(async () => {
            await New.member.ban();
            return ReportChnl.send({
              embeds: [
                embed
                  .setDescription(
                    `${this.client.config.arrow} **User**: ${New.author.tag} || ${New.author.id}\n${this.client.config.arrow} **Message**: \`${New.content}\`\n${this.client.config.arrow} **Blacklisted Word**: \`${docs.word}\`\n**Channel**: ${New.channel}`,
                  )
                  .setFooter("I couldn't dm them")
                  .setTitle('Banned a Member'),
              ],
            }).catch(() => {});
          });

        await New.member.ban();
        return ReportChnl.send({
          embeds: [
            embed
              .setDescription(
                `${this.client.config.arrow} **User**: ${New.author.tag} || ${New.author.id}\n${this.client.config.arrow} **Message**: \`${New.content}\`\n${this.client.config.arrow} **Blacklisted Word**: \`${docs.word}\`\n**Channel**: ${New.channel}`,
              )
              .setTitle('Banned a Member')
              .setFooter("I dm'd them"),
          ],
        }).catch(() => {});
      }
    }
  }
};
