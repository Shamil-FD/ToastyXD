const { Inhibitor } = require('discord-akairo');

module.exports = class StaffOnlyInhibitor extends Inhibitor {
	constructor() {
		super('staffOnly', {
			reason: 'staffOnly',
			type: 'post',
		});
	}

	exec(message, command) {
		if (command.staffOnly === true) {
			if (!message.member.roles.cache.get(this.client.config.StaffRole)) {
				return true;
			}
		}
	}
};
