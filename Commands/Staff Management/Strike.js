const Command = require('../../Util/Command.js');

module.exports = class StrikeCommand extends Command {
	constructor() {
		super('strike', {
			aliases: ['strike'],
			category: 'Staff Management',
			managerOnly: true,
			channel: 'guild',
			args: [
				{ id: 'user', type: 'memberMention' },
				{ id: 'reason', match: 'rest' },
			],
		});
	}

	async exec(message, { user, reason }) {
		let { staff } = this.client.models;
		if (!user)
			return message.send({
				embeds: { description: 'No member mention provided.' },
			});
		if (!reason)
			return message.send({ embeds: { description: 'Provide me a reason.' } });

		let doc = await staff.findOne({ user: user.id });
		doc.strikes ? doc.strikes++ : (doc.strikes = 1);
		await doc.save();
		await user
			.send("You've been given a strike. Strike reasoning: " + reason)
			.catch(() => {});
		return message.send({
			embeds: {
				description: `Striked ${user} for ${reason}. They now have ${doc.strikes} strike(s).`,
			},
		});
	}
};
