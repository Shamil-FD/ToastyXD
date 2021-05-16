const { Listener } = require('discord-akairo');

module.exports = class GuildMemberRemoveListener extends Listener {
	constructor() {
		super('guildMemberRemove', {
			emitter: 'client',
			event: 'guildMemberRemove',
		});
	}

	async exec(member) {
		// Remove First Time In Help Channel Thing
		if (await this.client.sql.get(`firstime: ${member.id}`)) {
			return this.client.sql.delete(`firstime: ${member.id}`);
		}
	}
};
