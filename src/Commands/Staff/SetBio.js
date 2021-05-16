const Command = require('../../Struct/Command.js');

module.exports = class SetbioCommand extends Command {
	constructor() {
		super('setbio', {
			aliases: ['setbio'],
			category: 'Staff',
			channel: 'guild',
			description: {
				info:
					'Set your bio on the Staff Info Card. Max 48 characters including spaces.',
				usage: ['t)setbio Message'],
			},
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
			return message.send({
				embeds: {
					description:
						"Didn't quite catch that.. Can you give me a description of yourself?",
					color: 'RED',
				},
			});
		if (bio.length > 48)
			return message.send({
				embeds: {
					description: "You can't make your bio longer than 48 characters.",
					color: 'RED',
				},
			});
		let doc = await staff.findOne({ user: message.author.id });
		doc.desc = bio;
		await doc.save();
		return message.send({
			embeds: { color: 'GREEN', description: `Set \`${bio}\` as your bio.` },
		});
	}
    async execSlash(message) {
        let { staff } = this.client.models;
        if (!message.member.roles.cache.has(this.client.config.StaffRole)) return message.reply("You can't use this command.", { ephemeral: true });
        message.defer();
        if (!message.options[0]?.value || message.options[0]?.value.length > 49) return message.editReply("You have to provide me a string that's no longer than 48 characters.", { ephemeral: true });
		        
		let doc = await staff.findOne({ user: message.member.id });        
        doc.desc = message.options[0]?.value;
        await doc.save();
        return message.editReply("Successfully saved changes.", { ephemeral: true });
    }
};
