const { Inhibitor } = require('discord-akairo');

module.exports = class ModeratorOnlyInhibitor extends Inhibitor {
  constructor() {
    super('moderatorOnly', {
      reason: 'moderatorOnly',
      type: 'post',
    });
  }

  exec(message, command) {
    if (command.moderatorOnly === true) {
      if (this.client.ownerID.includes(message.author.id)) return false;        
      if (!message.member.roles.cache.get(this.client.config.ModeratorRole)) {
        return true;
      }
    }
  }
};
