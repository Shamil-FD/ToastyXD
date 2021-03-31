const Command = require('../../Util/Command.js');
const { chnlmute } = require('../../Util/Models.js');

module.exports = class ChannelUnmuteCommand extends Command {
	constructor() {
		super('channelunmute', {
			aliases: ['channelunmute'],
			category: 'Staff',
			staffOnly: true,
			channel: 'guild',
			args: [
				{ id: 'user', type: 'memberMention' },
				{ id: 'reason', match: 'rest' },
			],
		});
	}

	async exec(message, { user, reason }) {
		let client = this.client;

		if (!user)
			return message.send({
				embeds: {
					color: 'RED',
					description: 'Proper usage: `t)channelunmute @User [reason]`',
				},
			});

		if (!reason)
			return message.send({
				embeds: {
					description: "I don't see any reason provided.",
					color: 'RED',
				},
			});

		let doc = await chnlmute.findOne({
			user: user.id,
			chnl: message.channel.id,
		});
		if (!doc)
			return message.send(
				client.embed().setDescription('They are already unmuted')
			);
		let hasError = false;

		await doc.delete();
		try {
			await message.channel.permissionOverwrites.get(user.id).delete();
		} catch (e) {
			hasError = true;
		}

		if (hasError === false) {
			message.send(
				client
					.embed()
					.setDescription(`Unmuted ${user} in this channel for ${reason}`)
					.setAuthor(
						message.author.username,
						message.author.displayAvatarURL({ dynamic: true })
					)
			);
		} else {
			message.send(
				this.client
					.embed()
					.setDescription(
						`${user} was already unmuted in channel ( They might have left ), but I deleted the document from my database.`
					)
					.setAuthor(
						message.author.username,
						message.author.displayAvatarURL({ dynamic: true })
					)
			);
		}

		message.guild.channels.cache.get(this.client.config.StaffReportChnl).send(
			client
				.embed()
				.setTitle('Unmuted')
				.setAuthor(
					`${this.client.arrow} Moderator: ${message.author.username}`,
					message.author.displayAvatarURL({ dynamic: true })
				)
				.addField(
					this.client.arrow + ' **Victim**:',
					`${user} || ${user.id}`,
					true
				)
				.addField(this.client.arrow + ' **Reason**:', reason, true)
				.addField(this.client.arrow + ' **Channel**:', message.channel, true)
		);
	}
};
