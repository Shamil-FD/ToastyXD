const { Inhibitor } = require('discord-akairo');

module.exports = class BetaInhibitor extends Inhibitor {
	constructor() {
		super('beta', {
			reason: 'beta',
			type: 'post',
		});
	}

	exec(message, command) {
		if (command.beta === true) {
			let access = [
				this.client.ownerID,
				'589390599740719105',
				'520797108257816586',
				'712560683216011274',
				'728211572446461973',
				'423222193032396801',
				'450212014912962560',
				'606138051051126794',
			];
			if (!access.includes(message.author.id)) {
				return true;
			}
		}
	}
};
