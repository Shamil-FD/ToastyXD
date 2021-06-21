const { Listener } = require('discord-akairo');

module.exports = class DebugListener extends Listener {
  constructor() {
    super('debug', {
      emitter: 'client',
      event: 'debug',
    });
  }

  exec(info) {
    //console.log(info);
  }
};
