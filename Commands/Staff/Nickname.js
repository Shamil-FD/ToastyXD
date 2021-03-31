const Command = require('../../Util/Command.js');

module.exports = class NicknameCommand extends Command {
	constructor() {
		super('nickname', {
			aliases: ['nickname', 'nick'],
			category: 'Staff',
			channel: 'guild',
			staffOnly: true,
			args: [
				{ id: 'user' },
				{
					id: 'ops',
					type: (msg, phrase) => {
						if (!phrase) return null;
						let arr = [
							'moderated',
							'mod',
							'copy',
							'copypaster',
							'dehoist',
							'hoist',
							'reset',
						];
						if (arr.includes(phrase)) return phrase;
						return msg.util.parsed.content;
					},
				},
			],
		});
	}

	async exec(message, { ops, user }) {
		let client = this.client;
		let stop = false;

		if (!ops)
			return message.send(message.author, {
				embeds: {
					color: 'RED',
					description:
						'Proper Usage: `t)nickname @User [mod | copy | reset | dehoist | Anything]`',
				},
			});
		ops = await ops.replace(user, '');
		ops = ops.trim();
		if (!user)
			return message.send(
				client.embed().setDescription('Are you sure that you provided a user?')
			);

		user = await message.getMember(user);
		if (!user)
			return message.send(
				client.embed().setDescription('In-invalid u-uuserrr! err!')
			);

		if (user.roles.cache.get(this.client.config.StaffRole))
			return message.send(
				client
					.embed()
					.setDescription(
						"Moderator changing a Moderator's nickname? That's a cap (whatever cap means)"
					)
			);

		let nick;
		if (ops == 'mod' || ops == 'moderated') nick = 'Moderated Nickname';
		else if (ops == 'copy' || ops == 'copypaster' || ops == 'paste')
			nick = 'Certified Copy-Paster';
		else if (ops == 'dehoist' || ops == 'hoist') nick = 'z I got Dehoisted';
		else if (ops == 'reset') nick = user.user.username;
		else nick = ops;
		// Change Nickname
		await user.setNickname(nick).catch(() => {
			stop = true;
			return message.send(
				client.embed().setDescription("I couldn't change their nickname, err!")
			);
		});
		if (stop == true) return;
		return message.send(
			client.embed().setDescription(`Changed ${user}'s nickname`)
		);
	}
};
