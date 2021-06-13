const Command = require('../../Struct/Command.js');

module.exports = class ExecCommand extends Command {
	constructor() {
		super('exec', {
			aliases: ['exec'],
			category: 'Staff Management',
			channel: 'guild',
			managerOnly: true,
			args: [
				{ id: 'user', type: 'memberMention' },
				{ id: 'content', match: 'rest' },
			],
		});
	}

	async exec(message, { user, content }) {
		if (!user || !content)
			return message.send({
				embeds: {
					description:
						'Proper Usage: t)exec @User t)CommandName <ARGS>\nExample: t)exec @User channelmute @User 5m He sucks',
				},
			});

		if (user.id === this.client.ownerID)
			return message.send(this.client.embed().setDescription('No dummy'));

		message.react(this.client.tick);
		message.author = user.user;
		message.content = content;
		message.mentions.members.delete(message.mentions.members.first().id);
		this.client.emit('message', message);
	}
};