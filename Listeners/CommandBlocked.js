const { Listener } = require('discord-akairo');

module.exports = class CommandBlockedListener extends Listener {
	constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked',
		});
	}

	exec(message, command, reason) {
		let result;
		if (reason === 'owner') return;
		else if (reason === 'guild')
			result = 'This command can only be used inside a guild';
		else if (reason === 'staffOnly')
			result = "You can't use this command. Very sadge";
		else if (reason === 'managerOnly')
			return message.send(
				'https://tenor.com/view/notthatclair-cerp-entertainment-wandavisionbycerp70s-wandavision-gif-20024594'
			);
		else if (reason === 'beta')
			result =
				'This command is only for beta testers for now. Please wait until the full release.';

		return message.send(message.author, { embeds: { description: result } });
	}
};
