const Command = require('../../Struct/Command');
const fetch = require('node-fetch');
const { MessageAttachment } = require('discord.js');

module.exports = class NotStonksCommand extends Command {
  constructor() {
    super('notstonks', {
      aliases: ['notstonks'],
      category: 'fun',
      useSlashCommand: true,
      slashCommand: {
        options: [
          {
            name: 'user',
            description: 'The not so stonky user',
            required: false,
            type: 'USER',
          },
        ],
      },
      args: [
        {
          id: 'user',
          type: 'user',
          default: (msg) => msg.author,
        },
      ],
    });
  }

  async exec(message, { user }) {
    let buffer = await meme(user.displayAvatarURL());
    return message.send({
      files: [new MessageAttachment(buffer, 'notstonks.png')],
    });
  }
  async execSlash(message) {
    let user = message.options[0]?.member ?? message.member;
    let buffer = await meme(user.user.displayAvatarURL());
    message.defer();
    return message.editReply({
      files: [new MessageAttachment(await buffer, 'notstonks.png')],
    });
  }
};
async function meme(user) {
  const data = await fetch(`https://vacefron.nl/api/stonks?user=${user}&notstonks=true`);
  return data.buffer();
}
