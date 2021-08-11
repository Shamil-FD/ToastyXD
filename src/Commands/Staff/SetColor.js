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

    await message.deferReply({ ephemeral: true });
    let doc = await this.client.tools.models.staff.findOne({ user: message.member.id });
    if (!doc) return message.editReply({ content: 'There was an error, please try again.', ephemeral: true });
    if (message.options.size < 0)
      return message.editReply({ ephemeral: true, content: 'You have to choose at least one option.' });

    // Variables:
    let border = message.options.get('borders')?.value;
    let bkg = message.options.get('background')?.value;
    let img = message.options.get('image')?.value;
    let text = message.options.get('text')?.value;
      
    border ? doc.infoCard.borders = border : null;
    bkg ? doc.infoCard.background = bkg : null;
    img ? doc.infoCard.img = img : null;
    text ? doc.infoCard.text = text : null;
    await doc.save();
    return message.editReply({ content: 'Successfully saved changes.', ephemeral: true });
  }
};
