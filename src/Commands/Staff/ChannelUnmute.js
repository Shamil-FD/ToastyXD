const Command = require('../../Struct/Command.js');
const { chnlmute } = require('../../Util/Models.js');

module.exports = class ChannelUnmuteCommand extends Command {
	constructor() {
		super('channelunmute', {
			aliases: ['channelunmute'],
			category: 'Staff',
			staffOnly: true,
			useSlashCommand: true,
			channel: 'guild',
			description: {
				info: 'Unmute a person who were muted in the current channel',
				usage: ['t)channelunmute User Reason'],
			},
			args: [
				{ id: 'user', type: 'memberMention' },
				{ id: 'reason', match: 'rest' },
			],
			slashCommand: {
				options: [
					{
						name: 'user',
						description: 'The user that is going to be unmuted.',
						type: 'USER',
						required: true,
					},
					{
						name: 'reason',
						description: 'The reason for the unmute.',
						type: 'STRING',
						required: true,
					},
				],
			},
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
						`${user} was already unmuted in this channel, but I deleted the document from my database.`
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
	async execSlash(message) {
		if (!message.member?.roles.cache.has(this.client.config.StaffRole))
			return message.reply("You can't use this command.", { ephemeral: true });
		let user = message.options[0]?.member;
		let reason = message.options[1]?.value;
		message.defer();

		let doc = await chnlmute.findOne({
			user: user?.id,
			chnl: message.channel.id,
		});
		if (!doc)
			return message.editReply(
				this.client.embed().setDescription('They are already unmuted.')
			);

		let hasError = false;
		await doc.delete();
		try {
			await message.channel.permissionOverwrites.get(user.id).delete();
		} catch (e) {
			hasError = true;
		}

		if (hasError === false) {
			message.editReply(
				this.client
					.embed()
					.setDescription(`Unmuted ${user} in this channel for ${reason}`)
					.setAuthor(
						message.member?.user?.username,
						message.member?.user?.displayAvatarURL({ dynamic: true })
					)
			);
		} else {
			message.editReply(
				this.client
					.embed()
					.setDescription(
						`${user} was already unmuted in this channel, but I deleted the document from my database.`
					)
					.setAuthor(
						message.member?.user?.username,
						message.member?.user?.displayAvatarURL({ dynamic: true })
					)
			);
		}

		return message.guild.channels.cache
			.get(this.client.config.StaffReportChnl)
			.send(
				this.client
					.embed()
					.setTitle('User Unmuted')
					.setAuthor(
						`${this.client.arrow} Moderator: ${message.member?.user?.username}`,
						message.member?.user?.displayAvatarURL({ dynamic: true })
					)
					.addField(
						this.client.arrow + ' **Victim**:',
						`${user} || ${user?.id}`,
						true
					)
					.addField(this.client.arrow + ' **Reason**:', reason, true)
					.addField(this.client.arrow + ' **Channel**:', message.channel, true)
			);
	}
};
