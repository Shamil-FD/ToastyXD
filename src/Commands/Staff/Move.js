const Command = require('../../Struct/Command.js');

module.exports = class MoveCommand extends Command {
  constructor() {
    super('move', {
      aliases: ['move'],
      category: 'Staff',
      description: {
        info: 'Off-topic conversation in a channel? Use this command to move them.',
        usage: ['t)move ChannelMention'],
      },
      staffOnly: true,
      useSlashCommand: true,
      args: [
        {
          id: 'chnl',
          type: 'channelMention',
        },
      ],
      slashCommand: {
        options: [
          {
            name: 'channel',
            type: 'CHANNEL',
            description: "The channel you're moving the conversation to.",
            required: true,
          },
        ],
      },
    });
  }
  async exec(message, { chnl }) {
    if (!chnl)
      return message.reply({
        embeds: [{ description: "You didn't give me a channel." }],
      });
    let embed = this.client.tools
      .embed()
      .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }));

    embed
      .setDescription(`Please continue the conversation in <#${chnl.id}>`)
      .setThumbnail('http://picsmine.com/wp-content/uploads/2017/04/Stop-Meme-stop-now.jpg')
      .setTitle('Off-Topic Conversation!')
      .setColor('RED'),
      await message
        .reply({
          embeds: [embed],
        })
        .then(() => {
          embed
            .setDescription(`Please continue the conversation in <#${chnl.id}>`)
            .setThumbnail(
              'http://www.quickmeme.com/img/dc/dc9a3d179c3d7f195c265e7e76f2a330547d096edfebcfa826eb3698d0019a0a.jpg',
            )
            .setTitle('Conversation Moved!')
            .setColor('GREEN'),
            chnl.send({
              embeds: [embed],
            });
        });
    return message.delete();
  }
  async execSlash(message) {
    if (!message.member?.roles.cache.has(this.client.config.StaffRole))
      return message.reply({ content: "You can't use this command.", ephemeral: true });
    if (message.options.get('channel').channel.type === 'category')
      return message.reply("You can't move a conversation to a category channel.");

    message.reply({
      embeds: [
        this.client.tools
          .embed()
          .setDescription(`Please continue the conversation in <#${message.options.get('channel')?.channel?.id}>`)
          .setThumbnail('http://picsmine.com/wp-content/uploads/2017/04/Stop-Meme-stop-now.jpg')
          .setTitle('Off-Topic Conversation!')
          .setColor('RED'),
      ],
    });
    return message.options.get('channel').channel.send({
      embeds: [
        this.client.tools
          .embed()
          .setDescription(`Continuing conversation from <#${message.channel.id}>`)
          .setThumbnail(
            'http://www.quickmeme.com/img/dc/dc9a3d179c3d7f195c265e7e76f2a330547d096edfebcfa826eb3698d0019a0a.jpg',
          )
          .setTitle('Conversation Moved!')
          .setColor('GREEN'),
      ],
    });
  }
};
