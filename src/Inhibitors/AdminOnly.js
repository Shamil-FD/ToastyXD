const { Inhibitor } = require('discord-akairo');

module.exports = class AdminOnlyInhibitor extends Inhibitor {
  constructor() {
    super('adminOnly', {
      reason: 'adminOnly',
      type: 'post',
    });
  }

  exec(message, command) {
    if (command.adminOnly === true) {
      if (this.client.ownerID.includes(message.author.id)) return false;
      if (!message.member.roles.cache.get(this.client.config.AdminRole)) {
        return true;
      }
    }
  }
};
