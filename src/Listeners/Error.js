const { Listener } = require('discord-akairo');

module.exports = class ErrorListener extends Listener {
  constructor() {
    super('error', {
      emitter: 'commandHandler',
      event: 'error',
    });
  }

  exec(e, message, command) {
    console.log(e);
    return message.reply({
      embeds: [
        this.client
          .embed()
          .setTitle('Error')
          .setDescription(`Error: \`\`\`${e}\`\`\`\nCommand: ${command.id ? command.id : "I don't know"}`)
          .setColor('RED'),
      ],
    });
  }
};
