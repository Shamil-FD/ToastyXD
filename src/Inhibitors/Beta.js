const { Inhibitor } = require('discord-akairo');

module.exports = class BetaInhibitor extends Inhibitor {
  constructor() {
    super('beta', {
      reason: 'beta',
      type: 'post',
    });
  }

  exec(message, command) {
    if (command.beta === true) {
      let access = [];
      if (!access.includes(message.author.id)) {
        return true;
      }
    }
  }
};
