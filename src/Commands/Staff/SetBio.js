const Command = require('../../Struct/Command.js');

module.exports = class SetbioCommand extends Command {
  constructor() {
    super('setbio', {
      aliases: ['setbio'],
      category: 'Staff',
      channel: 'guild',
      description: {
        info: 'Set your bio on the Staff Info Card. Max 48 characters including spaces.',
        usage: ['t)setbio Message'],
      },
      staffOnly: true,
      useSlashCommand: true,
      args: [
        {
          id: 'bio',
          match: 'content',
        },
      ],
      slashCommand: {
        options: [
          {
            name: 'bio',
            description: 'The bio you want to set as. Must not be longer than 48 characters.',
            required: true,
            type: 'STRING',
          },
        ],
      },
    });
  }

  async exec(message, { bio }) {
    let { staff } = this.client.tools.models;
    if (!bio)
      return message.reply({
        embeds: [{
          description: "Didn't quite catch that.. Can you give me a description of yourself?",
          color: 'RED',
        }],
      });
    if (bio.length > 48)
      return message.reply({
        embeds: [{
          description: "You can't make your bio longer than 48 characters.",
          color: 'RED',
        }],
      });
    let doc = await staff.findOne({ user: message.author.id });
    doc.desc = bio;
    await doc.save();
    return message.reply({
      embeds: [{ color: 'GREEN', description: `Set \`${bio}\` as your bio.` }],
    });
  }
  async execSlash(message) {
    let { staff } = this.client.tools.models;
    if (!message.member.roles.cache.has(this.client.config.StaffRole))
      return message.reply({ content: "You can't use this command.", ephemeral: true });
    await message.defer();

    if (!message.options.get('bio').value || message.options.get('bio').value.length > 49)
      return message.editReply({
        content: "You have to provide me a string that's no longer than 48 characters.",
        ephemeral: true,
      });

    let doc = await staff.findOne({ user: message.member.id });
    doc.desc = message.options.get('bio').value;
    await doc.save();
    return message.editReply({
      content: 'Successfully saved changes.',
      ephemeral: true,
    });
  }
};
