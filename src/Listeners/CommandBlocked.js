const { Listener } = require('discord-akairo');

module.exports = class CommandBlockedListener extends Listener {
  constructor() {
    super('commandBlocked', {
      emitter: 'commandHandler',
      event: 'commandBlocked',
    });
  }

  exec(message, command, reason) {
    let result;
    if (reason === 'owner') return;
    else if (reason === 'guild') result = 'This command can only be used inside a guild';
    else if (reason === 'staffOnly') result = "You can't use this command. Very sadge";
    else if (reason === 'managerOnly') result = "Maybe some day you'll be able to use this";
    else if (reason === 'beta')
      result = 'This command is only for beta testers for now. Please wait until the full release.';
    else if (reason === 'adminOnly') result = "You aren't special yet";
    let embed = this.client.tools.embed().setColor('RED').setDescription(result);
    return message.reply({ embeds: [embed] });
  }
};
