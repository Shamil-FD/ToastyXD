const Command; //= require('../../Util/Command.js');

module.exports = class ExampleCommand extends Command {
	constructor() {
		super('', {
			aliases: [''],
			category: 'misc',
			channel: 'guild',
		});
	}

	async exec(message) {}
};
