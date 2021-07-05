const Command = require('../../Struct/Command.js');

module.exports = class ResetStrikesCommand extends Command {
  constructor() {
    super('resetstrikes', {
      aliases: ['resetstrikes', 'resetstrike'],
      category: 'Staff Manager',
      channel: 'guild',
      managerOnly: true,
      args: [{ id: 'user', match: 'rest' }],
    });
  }

  async exec(message, { user }) {
    let { staff } = this.client.tools.models;
    user = await this.client.tools.getMember({ user: user, message: message });
    if (!user) return message.reply({ embeds: [{ description: 'Invalid user!' }] });

    let doc = await staff.findOne({ user: user.id });
    if (!doc)
      return message.reply({
        embeds: [{ description: "They don't have any strikes." }],
      });

    doc.strikes = 0;
    await doc.save();
    return message.reply({ embeds: [{ description: 'POOF! Begone strikes!' }] });
  }
};
