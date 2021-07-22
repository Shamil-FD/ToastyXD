const { Inhibitor } = require('discord-akairo');

module.exports = class BlacklistedChnlInhibitor extends Inhibitor {
  constructor() {
    super('blacklistedchnl', {
      reason: 'blacklistedchnl',
      type: 'post',
    });
  }

  exec(message, command) {
    if (message.channel.id === '709043664667672696') return true;
  }
};
