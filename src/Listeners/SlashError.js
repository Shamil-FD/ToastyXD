const {Listener} = require('discord-akairo');

module.exports = class ErrorListener extends Listener {
	constructor() {
		super('slashError', {
			emitter: 'commandHandler',
			event: 'slashError',
		});
	}

	exec(e, message, command) {
		message.reply('There was an error.');
		console.log(e);
	}
};
