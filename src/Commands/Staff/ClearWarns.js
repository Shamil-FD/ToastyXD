const Command = require('../../Struct/Command.js');

module.exports = class ClearWarnsCommand extends Command {
	constructor() {
		super('clearwarns', {
			aliases: ['clearwarns'],
			category: 'Staff',
			staffOnly: true,
			description: {
				info: "Clear one's warnings",
				usage: ['t)clearwarns User'],
			},
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
		if (
			user.id === message.author.id &&
			message.author.id != message.guild.ownerID
		)
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
	async execSlash(message) {
		if (!message.member?.roles.cache.has(this.client.config.StaffRole))
			return message.reply("You can't use this command.", { ephemeral: true });
		if (message.member.id === message.options[0]?.member?.id)
			return message.reply("You can't do that.", { ephemeral: true });
		message.defer();

		let docs = await this.client.models.warn.find({
			user: message.options[0]?.member?.id,
		});
		if (!docs.length)
			return message.editReply("They don't have any logged warns.");

		await message.editReply('Please wait..');
		try {
			await this.client.models.warn.deleteMany({
				user: message.options[0]?.member?.id,
			});
			return message.editReply('Successfully cleared all their warnings.');
		} catch (e) {
			console.error('Command: ClearWarns', e);
			return message.editReply('There was an error, please try again.');
		}
	}
};
