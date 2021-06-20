const Command = require('../../Struct/Command.js');
const {MessageEmbed} = require('discord.js');

module.exports = class EmbedCommand extends Command {
	constructor() {
		super('embed', {
			aliases: ['embed'],
			category: 'Staff',
			channel: 'guild',
			staffOnly: true,
			useSlashCommand: true,
			description: {
				info: 'Send an embed, easy. Optional things: title',
				usage: ['t)embed ChannelMention title: TITLE-HERE Message'],
			},
			args: [
				{id: 'chnl', type: 'channelMention'},
				{id: 'title', match: 'option', flag: 'title:'},
				{id: 'ping', match: 'flag', flag: 'ping'},
				{id: 'desc', match: 'rest'},
			],
			slashCommand: {
				options: [
					{
						name: 'channel',
						type: 'CHANNEL',
						description: 'The channel you want the embed to be sent.',
						required: true,
					},
					{
						name: 'description',
						type: 'STRING',
						description: 'Description of the embed.',
						required: 'true',
					},
					{
						name: 'title',
						type: 'STRING',
						description: 'Title of the embed.',
						required: false,
					},
					{
						name: 'color',
						type: 'STRING',
						description: 'Color of the embed.',
						required: false,
					},
				],
			},
		});
	}

	async exec(message, {chnl, title, desc, ping}) {
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
					message.author.displayAvatarURL({dynamic: true}),
				),
			);
		} else {
			chnl.send(
				embed.setFooter(
					message.author.tag,
					message.author.displayAvatarURL({dynamic: true}),
				),
			);
		}
		await message.send(this.client.embed().setDescription('Sent.'));
		return message.delete();
	}
	async execSlash(message) {
		if (!message.member.roles.cache.has(this.client.config.StaffRole))
			return message.reply("You can't use this command.", {ephemeral: true});

		let channel = message.options[0]?.channel || message.channel;
		if (channel.type === 'category')
			return message.reply("You can't send a message to a category channel.", {
				ephemeral: true,
			});

		let title;
		let color = message.options[3]?.value || 'RANDOM';
		if (message.options[1].value) title = message.options[2]?.value;
		let description = message.options[1]?.value;
		let embed = new MessageEmbed().setDescription(description);
		title ? embed.setTitle(title) : null;
		color ? embed.setColor(color) : embed.setColor('RANDOM');
		embed.setFooter(
			message.member.user.username,
			message.member.user.displayAvatarURL({dynamic: true}),
		);

		await channel.send(embed);
		return message.reply('Sent.', {ephemeral: true});
	}
};
