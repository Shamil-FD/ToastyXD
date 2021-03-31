const { Listener } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

module.exports = class MissingPermissionsListener extends Listener {
	constructor() {
		super('missingPermissions', {
			emitter: 'commandHandler',
			event: 'missingPermissions',
		});
	}

	exec(message, command, type, missing) {
		let person;
		if (type == 'client') person = 'I';
		else person = 'You';

		let bed = new MessageEmbed()
			.setColor('RANDOM')
			.setDescription(
				`${person} don't have the permission(s): \`${missing.join(', ')}\``
			)
			.setTimestamp();
		return message.reply(bed);
	}
};
