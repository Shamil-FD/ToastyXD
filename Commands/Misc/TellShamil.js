const Command = require('../../Util/Command.js');

module.exports = class TellShamilCommand extends Command {
	constructor() {
		super('tellshamil', {
			aliases: ['tellshamil'],
			category: 'misc',
			channel: 'guild',
			cooldown: 15000,
			args: [{ id: 'content', match: 'content' }],
		});
	}

	async exec(message, { content }) {
		if (!content && !message.attachments.first())
			return message.send({
				embeds: {
					description:
						'You have to provide me a message or an attachment to send to Shamil.',
					color: 'RED',
				},
			});

		message.delete();
		let str = this.client.config.Secrets[
			Math.round(this.client.config.Secrets.length * Math.random())
		];
		let msg = await message.send({
			embeds: {
				description: `Message: ${content}`,
				image: {
					url: message.attachments.first()
						? message.attachments.first().url
						: null,
				},
				author: {
					name: message.author.tag,
					iconURL: message.author.displayAvatarURL(),
				},
				fields: [{ name: 'Fun Fact About Shamil:', value: str }],
				footer: { text: 'React to this message to delete this message.' },
			},
		});

		await this.client.channels.cache.get('827849424196599828').send(
			this.client
				.embed()
				.setDescription(content)
				.setImage(
					message.attachments.first() ? message.attachments.first().url : null
				)
				.addField('Fun Fact About Shamil:', str)
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
		);
		try {
			await msg.react(this.client.tick);
			let collected = await msg.awaitReactions(
				(reaction, u) => u.id === message.author.id,
				{
					max: 1,
					time: 10000,
					errors: ['time'],
				}
			);
			if (collected.first().emoji.name === this.client.tick) {
				return msg.delete();
			}
		} catch (e) {
			await msg.reactions.removeAll();
			return msg.edit(
				this.client
					.embed()
					.setDescription(content)
					.setImage(
						message.attachments.first() ? message.attachments.first().url : null
					)
					.addField('Fun Fact About Shamil:', str)
					.setAuthor(message.author.tag, message.author.displayAvatarURL())
			);
		}
	}
};
