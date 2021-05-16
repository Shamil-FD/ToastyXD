const Command = require('../../Struct/Command.js');
const { warn } = require('../../Util/Models');

module.exports = class CaseCommand extends Command {
	constructor() {
		super('case', {
			aliases: ['case'],
			category: 'Staff',
			channel: 'guild',
			staffOnly: true,
			description: {
				info: 'Get info on a warning',
				usage: ['t)case CASE-ID'],
			},
			args: [{ id: 'id', type: 'number' }],
		});
	}

	async exec(message, { id }) {
		if (!id || id.isNaN)
			return message.send({
				embeds: { description: 'No Case ID = No Case Info', color: 'RED' },
			});

		let doc = await warn.findOne({ id: id });
		if (!doc)
			return message.send({
				embeds: { color: 'RED', description: `Case ID: ${id} doesn't exist!` },
			});

		return message.send(
			this.client
				.embed()
				.addField(this.client.arrow + ' Case Mod:', doc.mod)
				.addField(this.client.arrow + ' Case Victim:', `<@${doc.user}> || ${doc.user}`, true)
				.addField(this.client.arrow + ' Case Reason:', doc.reason, true)
				.addField(this.client.arrow + ' Case Date:', doc.date)
		);
	}
    async execSlash(message) {
        if (!message.member?.roles.cache.has(this.client.config.StaffRole)) return message.reply("You can't use this command.", { ephemeral: true });
        message.defer();
        
		let doc = await warn.findOne({ id: message.options[0]?.value.toString() });
        if (!doc) return message.editReply(`A case with the ID \`${message.options[0]?.value}\` doesn't exist.`);
        
        return message.editReply(this.client.embed().addField(this.client.arrow + ' Case Mod:', doc.mod).addField(this.client.arrow + ' Case Victim:', `<@${doc.user}> || ${doc.user}`, true).addField(this.client.arrow + ' Case Reason:', doc.reason, true).addField(this.client.arrow + ' Case Date:', doc.date));
    }
};
