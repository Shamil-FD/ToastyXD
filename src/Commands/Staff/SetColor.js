const Command = require('../../Struct/Command.js');
const { Util } = require('discord.js');

module.exports = class SetColorCommand extends Command {
  constructor() {
    super('setcolor', {
      aliases: ['setcolor'],
      category: 'Staff',
      channel: 'guild',
      description: {
        info: 'Set the background, text, border colors or set the background image of your Staff Info Card.',
        usage: [
          '/setcolor border #ff000f',
          '/setcolor text black',
          '/setcolor img ImageURL/ImageAttachment',
          '/setcolor #fffff',
        ],
      },
      staffOnly: true,
      useSlashCommand: true,
      slashCommand: {
        description: 'Change the color of your staff info card. HTML color codes or Hex codes',
        options: [
          {
            name: 'background',
            type: 'STRING',
            description: 'The background color of the card.',
            required: false,
          },
          {
            name: 'borders',
            type: 'STRING',
            description: 'The border color of the card.',
            required: false,
          },
          {
            name: 'text',
            type: 'STRING',
            description: 'The text color of the card.',
            required: false,
          },
          {
            name: 'image',
            type: 'STRING',
            description: 'The background image of the card ( Must be an image URL. ).',
            required: false,
          },
        ],
      },
    });
  }

  async exec(message) {
    return message.reply({
      embeds: [this.client.tools.embed().setDescription('This is disabled, use the slash command instead.')],
    });
  }
  async execSlash(message) {
    if (!message.member.roles.cache.has(this.client.config.StaffRole))
      return message.reply({ content: "You can't use this command.", ephemeral: true });

    await message.defer();
    let doc = await this.client.tools.models.staff.findOne({ user: message.member.id });
    if (!doc) return message.editReply({ content: 'There was an error, please try again.', ephemeral: true });
    if (message.options.size < 0)
      return message.editReply({ ephemeral: true, content: 'You have to choose at least one option.' });

    doc.infoCard.borders = message.options.get('borders')?.value || doc.infoCard?.borders;
    doc.infoCard.background = message.options.get('background')?.value || doc.infoCard?.background;
    doc.infoCard.img = message.options.get('image')?.value || 'none';
    doc.infoCard.text = message.options.get('text')?.value || doc.infoCard?.text;
    await doc.save();
    return message.editReply({ content: 'Successfully saved changes.', ephemeral: true });
  }
};
