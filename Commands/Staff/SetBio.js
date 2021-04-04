const Command = require('../../Util/Command.js');

module.exports = class SetbioCommand extends Command {
	constructor() {
		super('setbio', {
			aliases: ['setbio'],
			category: 'Staff',
			channel: 'guild',
			staffOnly: true,
			args: [
				{
					id: 'bio',
					match: 'content',
				},
			],
		});
	}

	async exec(message, { bio }) {
		let { staff } = this.client.models;
		if (!bio)
			return message.send(message.author, {
				embeds: {
					description:
						"Didn't quite catch that.. Can you give me a description of yourself?",
					color: 'RED',
				},
			});
        if(bio.length < 48) return message.send({ embeds: { description: "You can't make your bio no longer than 48 characters.", color: "RED"}})
		let doc = await staff.findOne({ user: message.author.id });
		doc.desc = bio;
		await doc.save();
		return message.send(message.author, {
			embeds: { color: 'GREEN', description: `Set \`${bio}\` as your bio.` },
		});
	}
};
