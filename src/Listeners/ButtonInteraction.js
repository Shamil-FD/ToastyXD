const { Listener } = require('discord-akairo');
const { MessageButton } = require('discord.js');

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
        await interaction.defer(true);
        if (!interaction.member?.roles.cache.has(this.client.config.StaffRole)) {
          await interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setColor('RED')
                .setDescription(`${interaction.member}, you can't use this button, dummy.`),
            ],
            ephemeral: true,
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

        await interaction.channel.createOverwrite(member.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
        await interaction.reply({
          embeds: [this.client.tools.embed().setDescription(`${member} now isn\'t able to see this channel.`)],
        });
        let acceptbtn = new MessageButton().setStyle('SUCCESS').setLabel('Accept').setCustomId('appealaccept');
        let openbtn = new MessageButton().setStyle('PRIMARY').setLabel('Open').setCustomId('appealopen');
        let deletebtn = new MessageButton().setStyle('DANGER').setLabel('Delete').setCustomId('appealdelete');
        let denybtn = new MessageButton().setStyle('DANGER').setLabel('Deny').setCustomId('appealdeny');
        return interaction.update({
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

        await interaction.channel.createOverwrite(member.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
        await interaction.reply({
          content: `Hey ${member.id}`,
          embeds: [this.client.tools.embed().setDescription(`${member} can now see this channel.`)],
        });
        let closebtn = new MessageButton().setStyle('DANGER').setLabel('Close').setCustomId('appealclose');
        return interaction.update({ embeds: interaction.embeds, components: [[closebtn]] });
      } else if (interaction.customId.toLowerCase() === 'appealaccept') {
        let member = await GetMember(interaction);
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

        await guild.members.unban(member.id, { reason: `Unbanned by ${interaction.member.user.tag}` });
        await guild.channels.cache
          .get(this.client.config.StaffReportChnl)
          .send({
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
        return interaction.update({ embeds: interaction.embeds, components: [[deletebtn]] });
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
        return interaction.update({ embeds: interaction.embeds, components: [[deletebtn]] });
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
