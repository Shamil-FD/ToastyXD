const { Flag } = require('discord-akairo');
const Command = require('../../../Struct/Command');

module.exports = class BlacklistCommand extends Command {
  constructor() {
    super('blacklist-list', {
      category: 'Staff',
      channel: 'guild',
      staffOnly: true,
    });
  }
  async exec(message) {
    let { models } = this.client.tools;
    let { arrow } = this.client.config;
    let docs = await models.blacklist.find();
    let str = await docs
      .map((documents) => `${arrow} ${documents.word} - ${documents.action} ${documents.wild ? `- wildcard` : ''}`)
      .join('\n');

    return message.reply({
      embeds: [{ description: str, title: 'Blacklisted Words' }],
    });
  }
};
