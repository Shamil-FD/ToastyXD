const Command = require('../../Struct/Command.js');
let { afk } = require('../../Util/Models');
let moment = require('moment');
let ms = require('ms');

module.exports = class AFKCommand extends Command {
  constructor() {
    super('afk', {
      aliases: ['afk'],
      category: 'misc',
      channel: 'guild',
      description: {
        info: 'Set your AFK status.',
        usage: ['t)afk away for 1 year'],
      },
      cooldown: 10000,
      useSlashCommand: true,
      slashCommand: {
        options: [
          {
            name: 'reason',
            description: 'The reason for the AFK',
            type: 'STRING',
            required: false,
          },
        ],
      },
      args: [
        {
          id: 'reason',
          match: 'rest',
          default: 'be back soon xoxo',
        },
      ],
    });
  }

  async exec(message, { reason }) {
    const doc = await afk.findOne({ user: message.author.id });

    if (!doc) {
      await new afk({
        user: message.author.id,
        count: 0,
        date: moment().format(),
        reason: reason,
      }).save();

      let bed = this.client.tools.embed().setDescription(`${message.author} is now AFK: ${reason}`);
      message.send(bed).then((msg) => {
        setTimeout(() => {
          message.delete();
        }, 15000);
      });
    }
  }
  async execSlash(message) {
    const doc = await afk.findOne({ user: message.member.id });
    let reason = message.options.get('reason').value || 'be back soon xo';
    await message.defer();

    if (!doc) {
      await new afk({
        user: message.member.id,
        count: 0,
        date: moment().format(),
        reason: reason,
      }).save();

      let bed = this.client.tools.embed().setDescription(`<@${message.member.id}> is now AFK: ${reason}`);
      return message.editReply({ embeds: [bed] });
    }
  }
};
