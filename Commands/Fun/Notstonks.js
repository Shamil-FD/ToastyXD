const Command = require('../../Util/Command');
const phin = require('phin');
const { MessageAttachment } = require('discord.js');

module.exports = class NotStonksCommand extends Command {
	constructor() {
		super('notstonks', {
			aliases: ['notstonks'],
			category: 'fun',

			args: [
				{
					id: 'user',
					type: 'user',
					default: (msg) => msg.author,
				},
			],
		});
	}

	async exec(message, { user }) {
		const data = await phin({
			url: `https://vacefron.nl/api/stonks?user=${user.displayAvatarURL({
				format: 'png',
			})}&notstonks=true`,
			method: 'get',
		});
		return message.channel.send(
			new MessageAttachment(data.body, 'notstonks.png')
		);
	}
};
