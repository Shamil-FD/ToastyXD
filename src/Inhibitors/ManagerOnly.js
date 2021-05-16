const { Inhibitor } = require('discord-akairo');

module.exports = class ManagerOnlyInhibitor extends Inhibitor {
	constructor() {
		super('managerOnly', {
			reason: 'managerOnly',
			type: 'post',
		});
	}

	exec(message, command) {
		if (command.managerOnly === true) {
            if (message.author.id === this.client.ownerID) return false;
			if (
				!message.member.roles.cache.get(this.client.config.StaffManagerRole)
			) {
				return true;
			}
		}
	}
};
