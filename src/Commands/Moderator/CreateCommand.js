const Command = require('../../Struct/Command.js');
const sourcebin = require('sourcebin');

module.exports = class CreateCommandCommand extends Command {
  constructor() {
    super('createcommand', {
      aliases: ['createcommand'],
      category: 'Moderator',
      description: {
        info: 'Create a custom command for the bot',
        usage: ['/createcommand'],
      },
      moderatorOnly: true,
      useSlashCommand: true,
      slashCommand: {
        options: [
          {
            name: 'link',
            type: 'STRING',
            description: 'The link to sourcebin with command code. Get a command template by using the template ops',
          },
          {
            name: 'template',
            description: 'Use this option to get the command template.',
            type: 'STRING',
            choices: [{ name: 'link', value: 'link' }],
          },
        ],
      },
    });
  }
  exec(message) {
    return message.reply({
      embeds: [{ description: 'This is disabled, use the slash command instead.' }],
    });
  }
  async execSlash(message) {
    if (message.options.get('template')) {
      return message.reply({
        embeds: [
          this.client.tools
            .embed()
            .setDescription(
              "Here's the link to the template: [Github Gist](https://gist.github.com/Shamil-FD/0c6ffdd7782113d6d98f32a46a87c488)",
            ),
        ],
        ephemeral: true,
      });
    } else if (message.options.get('link')) {
      await message.deferReply({ ephemeral: true });
      try {
        let code = await sourcebin.get(message.options.get('link')?.value);
        let sentMsg = await message.guild.channels.cache.get('861683396518739978').send({
          embeds: [
            this.client.tools
              .embed()
              .setDescription(`A new custom command suggestion. Link: ${code.url}`)
              .setAuthor(message.member.user.username, message.member.user.displayAvatarURL()),
          ],
        });
        await sentMsg.react('👍');
        await sentMsg.react('👎');
        await new this.client.tools.models.customCmd({
          user: message.member.id,
          link: code.key,
          msg: sentMsg.id,
        }).save();
        return message.editReply({ embeds: [this.client.tools.embed().setDescription('Done!')], ephemeral: true });
      } catch (e) {
        return message.editReply({
          embeds: [
            this.client.tools
              .embed()
              .setDescription('Either you provided an invalid link or there was an error talking to sourcebin.'),
          ],
          ephemeral: true,
        });
      }
    } else
      return message.editReply({
        embeds: [
          this.client.tools.embed().setDescription('You thought you could use this without choosing any options.'),
        ],
        ephemeral: true,
      });
  }
};
