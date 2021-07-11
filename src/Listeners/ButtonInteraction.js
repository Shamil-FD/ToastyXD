const _ = require('lodash');
const { Listener } = require('discord-akairo');
const { MessageAttachment, MessageButton } = require('discord.js');

module.exports = class ButtonListener extends Listener {
  constructor() {
    super('button', {
      emitter: 'client',
      event: 'interactionCreate',
    });
  }

  async exec(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId.toLowerCase() == 'purgeverify') {
        if (!interaction.member?.roles.cache.has(this.client.config.StaffRole)) {
          return interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setColor('RED')
                .setDescription(`${interaction.member}, you can't use this button, dummy.`),
            ],
            ephemeral: false,
            content: `<@${interaction.member.id}>`,
          });
        }
        let DeleteMessages = await FetchAndDelete(interaction);
        if (DeleteMessages.status === false) {
          await interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setColor('RED')
                .setDescription(`There was an error, try again later.\nError: \`\`\`${DeleteMessages.error}\`\`\``),
            ],
            ephemeral: true,
          });
        } else if (DeleteMessages.deleted > 0) {
          await interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setColor('GREEN')
                .setDescription(`Successfully deleted ${DeleteMessages.deleted} messages.`),
            ],
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            embeds: [this.client.tools.embed().setColor('RED').setDescription(`There are 0 unpinned messages, dummy.`)],
            ephemeral: true,
          });
        }
      } else if (interaction.customId.toLowerCase() == 'appealclose') {
        if (!interaction.member.roles.cache.has('823124026623918082'))
          return interaction.reply({
            embeds: [this.client.tools.embed().setDescription('Only staff can use this button.')],
          });

        let member = await GetMember(interaction);
        if (!member)
          return interaction.reply({
            embeds: [this.client.tools.embed().setDescription("I couldn't find the member in the server.")],
          });

        await interaction.channel.permissionOverwrites.create(member.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
        await interaction.reply({
          embeds: [this.client.tools.embed().setDescription(`${member} now isn\'t able to see this channel.`)],
        });
        let acceptbtn = new MessageButton().setStyle('SUCCESS').setLabel('Accept').setCustomId('appealaccept');
        let openbtn = new MessageButton().setStyle('PRIMARY').setLabel('Open').setCustomId('appealopen');
        let deletebtn = new MessageButton().setStyle('DANGER').setLabel('Delete').setCustomId('appealdelete');
        let denybtn = new MessageButton().setStyle('DANGER').setLabel('Deny').setCustomId('appealdeny');
        return interaction.message.edit({
          embeds: interaction.embeds,
          components: [[acceptbtn, denybtn, openbtn, deletebtn]],
        });
      } else if (interaction.customId.toLowerCase() === 'appealopen') {
        let member = await GetMember(interaction);
        if (!interaction.member.roles.cache.has('823124026623918082'))
          return interaction.reply({
            embeds: [this.client.tools.embed().setDescription('Only staff can use this button.')],
          });
        if (!member)
          return interaction.reply({
            embeds: [this.client.tools.embed().setDescription("I couldn't find the member in the server.")],
          });

        await interaction.channel.permissionOverwrites.create(member.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
        await interaction.reply({
          content: `Hey <@${member.id}>`,
          embeds: [this.client.tools.embed().setDescription(`${member} can now see this channel.`)],
        });
        let closebtn = new MessageButton().setStyle('DANGER').setLabel('Close').setCustomId('appealclose');
        return interaction.message.edit({ embeds: interaction.embeds, components: [[closebtn]] });
      } else if (interaction.customId.toLowerCase() === 'appealaccept') {
        let member = await GetMember(interaction);
        if (!member)
          return interaction.reply({
            embeds: [this.client.tools.embed().setDescription("I couldn't find the member in the server.")],
          });

        let guild = await this.client.guilds.cache.get('655109296400367618');
        let bannedInfo = await guild.bans.fetch(member.id).catch(() => {
          return undefined;
        });
        if (!bannedInfo)
          return interaction.reply({
            embeds: [this.client.tools.embed().setDescription(`I couldn't find ${member}'s ban in Salvage Squad.`)],
          });

        await guild.members.unban(member.id, { reason: `Unbanned by ${interaction.member.user.tag}` });
        await guild.channels.cache.get(this.client.config.StaffReportChnl).send({
          embeds: [
            this.client.tools
              .embed()
              .setTitle('Member Unban')
              .setDescription(
                `User: ${member.user.tag} | ${member.user.id}\nUnbanned By: ${interaction.member.user.tag} | ${interaction.member.id}`,
              ),
          ],
        });
        await member
          .send({
            embeds: [
              this.client.tools
                .embed()
                .setTitle('Unbanned')
                .setDescription(
                  `Your unban form was accepted and you are now unbanned in Salvage Squad. Here's a link to the [server](https://discord.gg/CBqNKzW7rn)`,
                ),
            ],
          })
          .catch(() => {});
        await interaction.reply({
          embeds: [
            this.client.tools
              .embed()
              .setDescription(`${member.user.tag} | ${member.id} has been unbanned from Salvage Squad.`),
          ],
        });
        await member.kick();
        let deletebtn = new MessageButton().setStyle('DANGER').setLabel('Delete').setCustomId('appealdelete');
        return interaction.message.edit({ embeds: interaction.embeds, components: [[deletebtn]] });
      } else if (interaction.customId.toLowerCase() === 'appealdeny') {
        let member = await GetMember(interaction);
        if (!interaction.member.roles.cache.has('823124026623918082'))
          return interaction.reply({
            embeds: [this.client.tools.embed().setDescription('Only staff can use this button.')],
          });
        if (!member)
          return interaction.reply({
            embeds: [this.client.tools.embed().setDescription("I couldn't find the member in the server.")],
          });

        let guild = await this.client.guilds.cache.get('655109296400367618');
        let bannedInfo = await guild.bans.fetch(member.id);
        if (!bannedInfo)
          return interaction.reply({
            embeds: [this.client.tools.embed().setDescription(`I couldn't find ${member}'s ban in Salvage Squad.`)],
          });

        await member
          .send({
            embeds: [this.client.tools.embed().setTitle('Unbanned').setDescription(`Your unban form was denied`)],
          })
          .catch(() => {});
        await interaction.reply({
          embeds: [this.client.tools.embed().setDescription(`${member.user.tag} | ${member.id} has been denied`)],
        });
        await member.kick();
        let deletebtn = new MessageButton().setStyle('DANGER').setLabel('Delete').setCustomId('appealdelete');
        return interaction.message.edit({ embeds: interaction.embeds, components: [[deletebtn]] });
      } else if (interaction.customId.toLowerCase() === 'appealdelete') {
        if (!interaction.member.roles.cache.has('823124026623918082'))
          return interaction.reply({
            embeds: [this.client.tools.embed().setDescription('Only staff can use this button.')],
          });
        await interaction.reply({
          embeds: [this.client.tools.embed().setDescription(`Deleting this channel in 5 seconds..`)],
        });
        await this.client.tools.wait(5000);
        return interaction.channel.delete();
      } else if (interaction.customId.toLowerCase().includes('verification')) {
        let member = await interaction.guild.members.fetch(interaction.member.id);
        let doc;
        if (member) doc = await this.client.tools.models.verification.findOne({ user: member.id });
        if (!member || interaction.member.id !== member.id || !doc)
          return interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setDescription(`Nice try, but you can't use another person's verification message.`),
            ],
            ephemeral: true,
          });

        doc?.count ? doc.count++ : (doc.count = 1);
        await doc.save();
        if (interaction.customId.replace('verification', ' ').trim() != doc.code) {
          if (doc?.count == 5) {
            await this.client.channels.cache
              .get(this.client.config.StaffReportChnl)
              .send({
                embeds: [
                  this.client.tools
                    .embed()
                    .setDescription(
                      `Kicked ${member.user.tag} | ${member.id} for exceeding 5 incorrect verification attempts.`,
                    )
                    .setTitle('Member Kick'),
                ],
              });
            await member
              .send({
                embeds: [
                  this.client.tools
                    .embed()
                    .setDescription(
                      `You've been kicked from Salvage Sqaud for exceeding 5 incorrect verification attempts. In simpler terms, you are too dumb to be in the server.`,
                    ),
                ],
              })
              .catch(() => {});
            return member.kick({ reason: '5 incorrect verification attempts.' });
          }
          return interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setDescription(
                  `You clicked the wrong button, you have ${
                    5 - doc.count
                  } more attempts until you get kicked! Please check which button is the same as the code shown in the image.\n\nIf the code is broken, use the command \`t)newcode\` for a new code.`,
                ),
            ],
            ephemeral: true,
          });
        }

        await interaction.reply({
          embeds: [
            this.client.tools
              .embed()
              .setDescription(`Thanks for joining ${interaction.guild.name}! Have an amazing stay!`),
          ],
          ephemeral: true,
        });
        await member.roles.remove(this.client.config.NotVerifiedRole);
        await this.client.channels.cache
          .get(this.client.config.StaffReportChnl)
          .send({
            embeds: [
              this.client.tools
                .embed()
                .setDescription(
                  `${this.client.config.arrow} **User**: ${member.user.tag} | \`${member.id}\`\n${this.client.config.arrow} **Code**: \`${doc.code}\`\n${this.client.config.arrow} **Tries**: \`${doc.count}\``,
                )
                .setTitle('Member Verfied'),
            ],
          });
        return doc.delete();
      } else if (interaction.customId.toLowerCase() === 'verifynow') {
        if (!interaction.member.roles.cache.get(this.client.config.NotVerifiedRole))
          return interaction.reply({
            embeds: [this.client.tools.embed().setDescription("You're already verified.")],
            ephemeral: true,
          });

        let doc = await this.client.tools.models.verification.findOne({ user: interaction.member.id });
        let cap = await this.client.tools.captcha();
        let buttons = [];
        let buttonColors = ['PRIMARY', 'DANGER', 'SUCCESS', 'PRIMARY', 'DANGER', 'SUCCESS'];
        let buttonColor = await buttonColors[await Math.round(Math.random() * buttonColors.length)];
        buttons.push(
          new MessageButton().setLabel(cap.word).setCustomId(`verification${cap.word}`).setStyle(buttonColor),
        );
        for (let i = 0; i < cap.randomNumbers.length - 1; i++) {
          buttons.push(
            new MessageButton()
              .setLabel(cap.randomNumbers[i])
              .setCustomId(`verification${cap.randomNumbers[i]}`)
              .setStyle(buttonColors[i]),
          );
        }
        buttons = await _.shuffle(buttons);
        if (!doc) {
          await new this.client.tools.models.verification({
            user: interaction.member.id,
            code: cap.word,
            count: 0,
          }).save();
        } else {
          doc.code = cap.word;
          await doc.save();
        }
       await interaction.reply({
          embeds: [
            this.client.tools
              .embed()
              .setDescription(
                '**Please click on the button corresponding to the code shown in the image above.\n\nIf the code is broken, use the command `t)newcode` to create a new one.\nThis message will be deleted in 5 minutes.**',
              )
              .setColor(cap.randomColor),
          ],
          files: [new MessageAttachment(cap.png, 'verify.png')],
          components: [buttons],
         });
         await this.client.tools.wait(require('ms')('5m'));
          return interaction.deleteReply()
      }
    }
  }
};

async function GetMember(interaction) {
  let member = await interaction.guild.members.fetch(interaction.channel.topic.slice(5).trim());
  return member || undefined;
}

async function FetchAndDelete(interaction) {
  let msgs = await interaction.channel.messages.fetch({ limit: 100 });
  msgs = msgs.filter((m) => m.pinned === false);
  try {
    await interaction.channel.bulkDelete(msgs);
    return { status: true, deleted: msgs.size };
  } catch (e) {
    console.log(e);
    return { status: false, error: e };
  }
}
