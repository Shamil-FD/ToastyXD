const Command = require('../../Struct/Command.js');
const moment = require('moment');
const _ = require('lodash');

module.exports = class EmbedCommand extends Command {
  constructor() {
    super('embed', {
      aliases: ['embed'],
      category: 'Staff',
      channel: 'guild',
      staffOnly: true,
      useSlashCommand: true,
      description: {
        info: 'Send an embed, easy.',
        usage: ['/embed Options'],
      },
      slashCommand: {
        options: [
          {
            name: 'channel',
            type: 'CHANNEL',
            description: 'The channel you want the embed to be sent.',
            required: true,
          },
          {
            name: 'description',
            type: 'STRING',
            description: 'Description of the embed.',
            required: true,
          },
          {
            name: 'ping',
            type: 'BOOLEAN',
            description: "If the bot should ping @everyone. USE THIS ONLY IF IT'S NEEDED.",
          },
          {
            name: 'title',
            type: 'STRING',
            description: 'Title of the embed.',
            required: false,
          },
          {
            name: 'color',
            type: 'STRING',
            description: 'Color of the embed.',
            required: false,
          },
          {
            name: 'footer',
            type: 'STRING',
            description: 'Footer of the embed.',
          },
        ],
      },
    });
  }

  async exec(message) {
    return message.reply({
      embeds: [this.client.embed().setDescription('This is disabled, use the slash command instead.')],
    });
  }
  async execSlash(message) {
    if (!message.member.roles.cache.has(this.client.config.StaffRole))
      return message.reply({ content: "You can't use this command.", ephemeral: true });

    let channel = message.options.get('channel').channel;
    if (channel.type === 'category')
      return message.reply({
        content: "You can't send a message to a category channel.",
        ephemeral: true,
      });

    let title = message.options.get('title')?.value || null;
    let color = message.options.get('color')?.value || null;
    let description = message.options.get('description').value;
    let footer = message.options.get('footer')?.value || null;

    if (footer && footer.length > 1047) {
      footer = _.truncate(footer, {
        length: footer.length - `.. by ${message.member.displayName}`.length,
        omission: `.. by ${message.member.displayName}`,
      });
    }

    let embed = this.client.embed().setDescription(description);
    title ? embed.setTitle(title) : null;
    color ? embed.setColor(color) : null;
    footer
      ? embed.setFooter(footer, message.member.user.displayAvatarURL({ dynamic: true }))
      : embed.setFooter(message.member.displayName, message.member.user.displayAvatarURL({ dynamic: true }));

    if (message.options.get('ping')?.value)
      await message.guild.channels.cache
        .get('850627411698647050')
        .send(
          `${message.member.user.tag} | ${message.member.id} used @/everyone ping on /embed that was sent in <#${
            channel.id
          }>. Message was sent at ${moment().format('DD/MM/YY hh:mm')}`,
        );
    await channel.send({ content: `${message.options.get('ping')?.value ? '@everyone' : ''}`, embeds: [embed] });
    return message.reply({ content: 'Sent.', ephemeral: true });
  }
};
