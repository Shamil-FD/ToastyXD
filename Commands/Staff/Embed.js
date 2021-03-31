const Command = require('../../Util/Command.js');

module.exports = class EmbedCommand extends Command {
	constructor() {
		super('embed', {
			aliases: ['embed'],
			category: 'Staff',
			channel: 'guild',
			staffOnly: true,
			args: [
				{ id: 'chnl', type: 'channelMention' },
				{ id: 'title', match: 'option', flag: 'title:' },
				{ id: 'ping', match: 'flag', flag: 'ping' },
				{ id: 'desc', match: 'rest' },
			],
		});
	}

	async exec(message, { chnl, title, desc, ping }) {
		if (!chnl || !desc)
			return message.send({
				embeds: {
					color: 'RED',
					description:
						'Proper Usage: t)embed [Channel] <title: Title-Here-No-Spaces> [Description]',
				},
			});

		let embed = this.client.embed().setDescription(desc);
		if (title) {
			embed.setTitle(title.replace(/-/gi, ' '));
		}
		if (ping) {
			chnl.send(
				'@everyone',
				embed.setFooter(
					message.author.tag,
					message.author.displayAvatarURL({ dynamic: true })
				)
			);
		} else {
			chnl.send(
				embed.setFooter(
					message.author.tag,
					message.author.displayAvatarURL({ dynamic: true })
				)
			);
		}
		message.delete();
		return message.send(this.client.embed().setDescription('Sent.'));
	}
};
