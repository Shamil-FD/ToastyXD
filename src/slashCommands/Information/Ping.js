const Command = require('../../structure/SlashCommand');
const ms = require('pretty-ms');

module.exports = class PingCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'ping',
        category: 'Information',
        description: 'The ping of the bot'       
      });
    }

    run(message) {
        return message.reply({ embeds: [message.client.tools.embed().setDescription(`API: ${Math.round(message.client.ws.ping)}ms\nUptime: ${ms(message.client.uptime)}`)] });
    }
};