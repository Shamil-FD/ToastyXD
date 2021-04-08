const Command = require('../../Util/Command');
const fetch = require('node-fetch');
const { MessageAttachment } = require('discord.js');

module.exports = class StonksCommand extends Command {
	constructor() {
		super('stonks', {
			aliases: ['stonks'],
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
		const data = await fetch(
			`https://vacefron.nl/api/stonks?user=${user.displayAvatarURL({
				format: 'png',
			})}`
		);
		const buffer = await data.buffer();
		return message.channel.send(new MessageAttachment(buffer, 'stonks.png'));
	}
};
