const { Listener } = require('discord-akairo');

module.exports = class ErrorListener extends Listener {
  constructor() {
    super('slashError', {
      emitter: 'commandHandler',
      event: 'slashError',
    });
  }

  exec(e, message, command) {
    if (message.replied) message.editReply(`There was an error.\n\`\`\`${e.stack}\`\`\``);
    else message.reply(`There was an error.\n\`\`\`${e.stack}\`\`\``);
    console.log(e);
  }
};
