const { Listener } = require('discord-akairo');

module.exports = class ThreadCreateListener extends Listener {
  constructor() {
    super('threadCreate', {
      emitter: 'client',
      event: 'threadCreate',
    });
  }

  async exec(thread) {
    return thread.join();
  }
};
