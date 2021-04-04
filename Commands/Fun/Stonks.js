const Command = require('../../Util/Command');
const phin = require('phin');
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
		const data = await phin({
			url: `https://vacefron.nl/api/stonks?user=${user.displayAvatarURL({
				format: 'png',
			})}`,
			method: 'get',
		});
		return message.channel.send(new MessageAttachment(data.body, 'stonks.png'));
	}
};
