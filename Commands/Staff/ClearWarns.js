const Command = require('../../Util/Command.js');

module.exports = class ClearWarnsCommand extends Command {
	constructor() {
		super('clearwarns', {
			aliases: ['clearwarns'],
			category: 'Staff',
			staffOnly: true,
			args: [{ id: 'user', match: 'content' }],
			channel: 'guild',
		});
	}

	async exec(message, { user }) {
		user = await message.getMember(user);
		if (!user)
			return message.send({
				embeds: { description: 'You have to provide me a user.', color: 'RED' },
			});
		if (user.id === message.author.id && message.author.id != message.guild.ownerID)
			return message.send({
				embeds: { description: "Sorry, can't do that.", color: 'RED' },
			});

		let { warn } = this.client.models;
		let docs = await warn.find({ user: user.id });

		if (!docs.length)
			return message.send({
				embeds: {
					description: "They don't have any logged warns.",
					color: 'RED',
				},
			});
		let msg = await message.send({
			embeds: { description: 'Clearing all warnings..' },
		});
		await warn.deleteMany({ user: user.id });
		return msg.edit(
			this.client
				.embed()
				.setDescription('Cleared all their warnings..')
				.successColor()
		);
	}
};
