const { MessageAttachment } = require('discord.js');
const Command = require('../../Struct/Command');
const fetch = require('node-fetch');

module.exports = class StonksCommand extends Command {
  constructor() {
    super('stonks', {
      aliases: ['stonks'],
      category: 'fun',
      useSlashCommand: true,
      slashCommand: {
        options: [
          {
            name: 'user',
            description: 'The stonky user.',
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
      files: [new MessageAttachment(await buffer, 'stonks.png')],
    });
  }
  async execSlash(message) {
    let user = message.options.get('user')?.member ?? message.member;
    let buffer = await meme(user.user.displayAvatarURL());
    await message.defer();
    return message.editReply({
      files: [new MessageAttachment(await buffer, 'stonks.png')],
    });
  }
};
async function meme(user) {
  const data = await fetch(`https://vacefron.nl/api/stonks?user=${user}`);
  return data.buffer();
}
