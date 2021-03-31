const Command = require('../../Util/Command.js');
const { warn } = require('../../Util/Models');
const moment = require('moment');

module.exports = class RemoveWarnCommand extends Command {
	constructor() {
		super('removewarn', {
			aliases: ['removewarn', 'rw'],
			category: 'Staff',
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
			return message.send(
				this.client.embed().setDescription(`Case ID: ${id} doesn't exist!`)
			);

		message.channel.send(
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
};
