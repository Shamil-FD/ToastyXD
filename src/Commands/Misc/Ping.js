const Command = require('../../Struct/Command.js');
const { MessageEmbed } = require('discord.js');
const ms = require('pretty-ms');

module.exports = class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			category: 'misc',
		});
	}

	async exec(message) {
		message.send(new MessageEmbed().setDescription('Pong!')).then((m) =>
			m.edit(
				new MessageEmbed()
					.setDescription(
						`Message roundtrip: ${
							m.createdTimestamp - message.createdTimestamp
						}ms\nAPI: ${Math.round(this.client.ws.ping)}ms\nUptime: ${ms(this.client.uptime)}`
					)
					.setFooter('Vrooom', this.client.user.displayAvatarURL())
            		.setColor("RANDOM")
			)
		);
	}
    async execSlash(message) {
        message.reply("Pong!");
        return message.editReply(new MessageEmbed().setDescription(`API: ${Math.round(this.client.ws.ping)}ms\nUptime: ${ms(this.client.uptime)}`).setFooter('Vrooom', this.client.user.displayAvatarURL()).setColor("RANDOM"))
    }
};
