const Command = require('../../Struct/Command.js');
const { exec } = require('child_process');

module.exports = class ForcePullCommand extends Command {
	constructor() {
		super('forcepull', {
			aliases: ['forcepull', 'fp'],
			category: 'Staff Management',
			managerOnly: true,
		});
	}

	async exec(message) {
		exec(`git pull ${this.client.config.Github}`, () => {
			exec('yarn', console.log);
		});
		return message.react(this.client.tick);
	}
};
