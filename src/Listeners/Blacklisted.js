const { Listener } = require('discord-akairo');
const blacklisted = require('../Util/Models').blacklist;
const _ = require('lodash');
const moment = require('moment');
const { Util } = require('discord.js');

module.exports = class BlackListListener extends Listener {
  constructor() {
    super('blacklist', {
      emitter: 'client',
      event: 'messageCreate',
    });
  }

  async exec(message) {
    // Check if testMode is turned on
    if (this.client.config.testMode === true) return;
    if (message.guild.id !== '655109296400367618') return;
    if (message.author.bot === true) return;
    if (['DM', 'GUILD_VOICE', 'GUILD_CATEGORY', 'GUILD_STAGE_VOICE'].includes(message.channel.type)) return;
    let { content } = message;
    content = Util.escapeMarkdown(content);
    content = content.replace(/`/g, '');
    // Blacklisted Word Detector ( Not The Best )
    let doc = await blacklisted.find();
    let newContent;
    let docs;
    doc = doc.filter((documents) => documents.wild === true);

    for (let o = 0; o < doc.length; o++) {
      let regex = new RegExp(doc[o].word, 'gi');
      newContent = await content.match(regex);
      newContent = _.compact(newContent);
      if (newContent.length) {
        docs = doc[o];
        break;
      }
    }
    if (!newContent || !newContent.length) {
      newContent = content.toLowerCase().split(' ');
      newContent = _.compact(newContent);
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
      if (
        message.content.toLowerCase().startsWith(`${this.client.config.prefix}blacklist`) &&
        message.member.roles.cache.get(this.client.config.StaffRole)
      )
        return;
      let action = docs.action;
      message.delete();
      let embed = this.client.tools
        .embed()
        .setAuthor('Blacklisted Word Detected!', this.client.user.displayAvatarURL())
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
      let ReportChnl = await message.guild.channels.cache.get(this.client.config.StaffReportChnl);

      if (action === 'delete') {
        return ReportChnl.send({
          embeds: [
            embed.setDescription(
              `${this.client.config.arrow} **User**: ${message.author} || ${message.author.id}\n${this.client.config.arrow} **Message**: \`${message.content}\`\n${this.client.config.arrow} **Blacklisted Word**: \`${docs.word}\`\n${this.client.config.arrow} **Channel**: ${message.channel}`,
            ),
          ],
        }).catch(() => {});
      } else if (action === 'warn') {
        await message.author
          .send({
            embeds: [
              this.client.tools
                .embed()
                .setDescription(`Please do not use ${docs.word} in your messages. You have been warned.`)
                .setFooter("Salvage's Oasis", message.guild.iconURL({ dynamic: true }))
                .setTitle('Message Deleted.'),
            ],
          })
          .catch(() => {
            message.reply(`Please do not use ${docs.word} in your messages. You have been warned.`);
          });

        return ReportChnl.send({
          embeds: [
            embed
              .setDescription(
                `${this.client.config.arrow} **User**: ${message.author} || ${message.author.id}\n${this.client.config.arrow} **Message**: \`${message.content}\`\n${this.client.config.arrow} **Blacklisted Word**: \`${docs.word}\`\n${this.client.config.arrow} **Channel**: ${message.channel}`,
              )
              .setTitle('Verbal Warn'),
          ],
        }).catch(() => {});
      } else if (action === 'kick') {
        await message.author
          .send({
            embeds: [
              embed.setDescription(
                `You have been kicked from ${message.guild.name} due to the usage of the word ${docs.word} in your message`,
              ),
            ],
          })
          .catch(async () => {
            await message.member.kick();
            return ReportChnl.send({
              embeds: [
                embed
                  .setDescription(
                    `${this.client.config.arrow} **User**: ${message.author.tag} || ${message.author.id}\n${this.client.config.arrow} **Message**: \`${message.content}\`\n${this.client.config.arrow} **Blacklisted Word**: \`${docs.word}\`\n${this.client.config.arrow} **Channel**: ${message.channel}`,
                  )
                  .setTitle('Kicked a Member')
                  .setFooter("I couldn't dm them"),
              ],
            }).catch(() => {});
          });

        await message.member.kick();
        return ReportChnl.send({
          embeds: [
            embed
              .setDescription(
                `${this.client.config.arrow} **User**: ${message.author.tag} || ${message.author.id}\n${this.client.config.arrow} **Message**: \`${message.content}\`\n${this.client.config.arrow} **Blacklisted Word**: \`${docs.word}\`\n${this.client.config.arrow} **Channel**: ${message.channel}`,
              )
              .setFooter("I dm'd them")
              .setTitle('Kicked a Member'),
          ],
        }).catch(() => {});
      } else if (action === 'ban') {
        await message.author
          .send({
            embeds: [
              embed.setDescription(
                `You have been banned from ${message.guild.name} due to the usage of the word ${docs.word} in your message\nJoin https://discord.gg/Xbbp7N87dM for a chance to get unbanned by submitting an appeal.`,
              ),
            ],
          })
          .catch(async () => {
            await message.member.ban();
            return ReportChnl.send({
              embeds: [
                embed
                  .setDescription(
                    `${this.client.config.arrow} **User**: ${message.author.tag} || ${message.author.id}\n${this.client.config.arrow} **Message**: \`${message.content}\`\n${this.client.config.arrow} **Blacklisted Word**: \`${docs.word}\`\n**Channel**: ${message.channel}`,
                  )
                  .setFooter("I couldn't dm them")
                  .setTitle('Banned a Member'),
              ],
            }).catch(() => {});
          });

        await message.member.ban();
        return ReportChnl.send({
          embeds: [
            embed
              .setDescription(
                `${this.client.config.arrow} **User**: ${message.author.tag} || ${message.author.id}\n${this.client.config.arrow} **Message**: \`${message.content}\`\n${this.client.config.arrow} **Blacklisted Word**: \`${docs.word}\`\n**Channel**: ${message.channel}`,
              )
              .setTitle('Banned a Member')
              .setFooter("I dm'd them"),
          ],
        }).catch(() => {});
      }
    }
  }
};
