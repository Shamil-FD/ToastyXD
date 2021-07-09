const Command = require('../../Struct/Command.js');

module.exports = class ExecCommand extends Command {
  constructor() {
    super('exec', {
      aliases: ['exec'],
      category: 'Staff Manager',
      channel: 'guild',
      managerOnly: true,
      args: [
        { id: 'user', type: 'memberMention' },
        { id: 'content', match: 'rest' },
      ],
    });
  }

  async exec(message, { user, content }) {
    if (!user || !content)
      return message.reply({
        embeds: [
          {
            description:
              'Proper Usage: t)exec @User t)CommandName <ARGS>\nExample: t)exec @User channelmute @User 5m He sucks',
          },
        ],
      });

    if (this.client.ownerID.includes(user.id))
      return message.reply({ embeds: [this.client.tools.embed().setDescription('No dummy')] });

    message.react(this.client.config.tick);
    message.author = user.user;
    message.content = content;
    message.mentions.members.length ? message.mentions.members.delete(message.mentions.members.first().id) : null;
    this.client.emit('message', message);
  }
};
