const Command = require('../../Util/Command.js');

module.exports = class EditmsgCommand extends Command {
	constructor() {
		super('editmsg', {
			aliases: ['editmsg'],
			category: 'Staff Management',
			managerOnly: true,
			channel: 'guild',
			args: [
				{ id: 'channel', type: 'channelMention' },
				{ id: 'id' },
				{ id: 'title', match: 'option', flag: 'title:' },
				{ id: 'content', match: 'rest' },
			],
		});
	}

	async exec(message, { channel, id, title, content }) {
		let client = this.client;
		let embed = client.embed();
		if (!channel)
			return message.send(
				't)editmsg #Channel MESSAGEID <optional `title: title-here`> DESCRIPTION'
			);
		if (!id)
			return message.send(
				't)editmsg #Channel MESSAGEID <optional `title: title-here`> DESCRIPTION'
			);
		if (!content)
			return message.send(
				't)editmsg #Channel MESSAGEID <optional `title: title-here`> DESCRIPTION'
			);
		let found = await channel.messages.fetch(id);
		if (!found) return message.send("Can't find the message.");
		if (title) {
			embed.setTitle(title.replace(/-/gi, ' '));
		}
		await found
			.edit(embed.setDescription(content).setFooter(' '))
			.then(() => {
				return message.send(`Message Edited`);
			})
			.catch(() => {
				return message.send("I couldn't edit the message");
			});
	}
};
