const Command = require('../../Util/Command');
const fetch = require('node-fetch');
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
		await fetch(
			`https://vacefron.nl/api/stonks?user=${user.displayAvatarURL({
				format: 'png',
			})}&notstonks=true`
		)
			.then((m) => m.buffer())
			.then((m) => {
				return message.channel.send(new MessageAttachment(m, 'notstonks.png'));
			});
	}
};
