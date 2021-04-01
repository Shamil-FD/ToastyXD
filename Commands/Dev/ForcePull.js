const Command = require('../../Util/Command.js');
const { exec } = require('child_process');

module.exports = class ForcePullCommand extends Command {
	constructor() {
		super('forcepull', {
			aliases: ['forcepull', 'fp'],
			category: 'Shamil',
      managerOnly: true,
		});
	}

	async exec(message) {
    exec(`git pull ${this.client.config.Github}`, () => {
        exec('npm i', console.log);
    });
    return message.react(this.client.tick);
  }
};
