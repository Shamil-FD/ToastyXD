const Command = require('../../Struct/Command.js');
const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = class AppealCommand extends Command {
  constructor() {
    super('appeal', {
      aliases: ['appeal'],
      category: 'appeal',
      description: {
        info: 'Use this command to appeal for an unban.',
        usage: ['t)appeal'],
      },
      appealServerOnly: true,
    });
  }
  async exec(message) {
    let msg = await message.reply({
      embeds: [this.client.tools.embed().setDescription('Please wait while I check for your ban record..')],
    });
    let guild = await this.client.guilds.cache.get('655109296400367618');
    let bannedInfo = await guild.bans.fetch(message.author.id).catch(() => {
      return undefined;
    });
    if (!bannedInfo)
      return msg.edit({ embeds: [this.client.tools.embed().setDescription("You aren't banned in Salvage Squad.")] });

    let category = await message.guild.channels.cache.get('823128094051008515');
    let children = category.children;
    children = await children.filter((c) => c.topic.includes(message.author.id));
    if (children.size)
      return msg.edit({
        embeds: [
          this.client.tools.embed().setDescription(`You already have a appeal channel opened at <#${children.id}>.`),
        ],
      });

    let channel = await message.guild.channels.create(message.author.username, {
      topic: `User: ${message.author.id}`,
      parent: category,
      permissionOverwrites: [
        { id: message.guild.id, deny: ['VIEW_CHANNEL'] },
        { id: message.author.id, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'] },
        { id: '823124026623918082', allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
      ],
    });
    let button = new MessageActionRow().addComponents([
      new MessageButton().setCustomId('appealclose').setLabel('Close').setStyle('PRIMARY'),
    ]);

    let m = await channel.send({
      embeds: [
        this.client.tools
          .embed()
          .setDescription(
            `${message.member} wants to appeal for a ban.\n${
              bannedInfo?.reason
                ? `Banned Reason: \`${bannedInfo?.reason}\`\n\nTo appealer:\n1. Why should we unban you?\n2. How long has it been since you've got banned?`
                : "To appealer:\n1. Why were you banned?\n2. Why should be unban you?\n3. How long has it been since you've got banned?"
            }`,
          ),
      ],
      components: [button],
    });
    await m.pin();
    return msg.edit({ embeds: [this.client.tools.embed().setDescription(`Please appeal at <#${channel.id}>`)] });
  }
};
