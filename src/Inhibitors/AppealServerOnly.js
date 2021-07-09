const { Inhibitor } = require('discord-akairo');

module.exports = class AppealServerOnlyInhibitor extends Inhibitor {
  constructor() {
    super('appealServerOnly', {
      reason: 'appealServerOnly',
      type: 'post',
    });
  }

  exec(message, command) {
    if (command.appealServerOnly === true) {
      if (message.guild.id === '822925965855424542') return false;
      else return true;
    }
  }
};
