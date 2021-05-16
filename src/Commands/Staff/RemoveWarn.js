const Command = require('../../Struct/Command.js');
const { warn } = require('../../Util/Models');
const moment = require('moment');

module.exports = class RemoveWarnCommand extends Command {
	constructor() {
		super('removewarn', {
			aliases: ['removewarn', 'rw'],
			category: 'Staff',
			description: {
				info: "Remove a user's warn.",
				usage: ['t)removewarn Case-ID'],
			},
			channel: 'guild',
			staffOnly: true,
			args: [{ id: 'id', type: 'number' }],
		});
	}

	async exec(message, { id }) {
		if (!id || id.isNaN)
			return message.send(
				this.client
					.embed()
					.setDescription('Huh.. Remove nothing?')
					.setColor('RED')
			);

		let doc = await warn.findOne({ id: id });
		if (!doc)
			return message.send({
				embeds: { description: `Case ID: ${id} doesn't exist!` },
			});

		message.send(
			this.client
				.embed()
				.setDescription(`Deleted Case ID: ${id}`)
				.addField(
					this.client.arrow + ' **Case Victim**:',
					`<@${doc.user}> || ${doc.user}`,
					true
				)
				.addField(this.client.arrow + ' **Case Reason**:', doc.reason, true)
				.setTitle(message.author.username)
				.setAuthor(`${this.client.arrow} Case Moderator: ${doc.mod}`)
		);
		await doc.delete();
	}
    async execSlash(message) {
        if (!message.member.roles.cache.has(this.client.config.StaffRole)) return message.reply("You can't use this command.", { ephemeral: true });
        message.defer()
		let doc = await warn.findOne({ id: message.options[0]?.value });
        
        if (!doc) return message.editReply(`A case ID with \`${message.options[0]?.value}\` doesn't exist.`, { ephemeral: true });
        await message.editReply(
			this.client
				.embed()
				.setDescription(`Deleted Case ID: ${id}`)
				.addField(
					this.client.arrow + ' **Case Victim**:',
					`<@${doc.user}> || ${doc.user}`,
					true
				)
				.addField(this.client.arrow + ' **Case Reason**:', doc.reason, true)
				.setTitle(message.member.user.username)
				.setAuthor(`${this.client.arrow} Case Moderator: ${doc.mod}`))
        return doc.delete()
		
    }
};
