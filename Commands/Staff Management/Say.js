const Command = require('../../Util/Command.js');

module.exports = class SayCommand extends Command {
	constructor() {
		super('say', {
			aliases: ['say'],
			category: 'Staff Management',
			managerOnly: true,
			prefix: '/',
			typing: true,
			args: [{ id: 'content', match: 'content' }],
		});
	}

	async exec(message, { content }) {
		if (!content) return;
		await message.delete();
		return message.send(content);
	}
};
