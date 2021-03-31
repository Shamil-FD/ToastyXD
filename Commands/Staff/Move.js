const Command = require('../../Util/Command.js');

module.exports = class MoveCommand extends Command {
	constructor() {
		super('move', {
			aliases: ['move'],
			category: 'Staff',
			staffOnly: true,
			args: [
				{
					id: 'chnl',
					type: 'channelMention',
				},
			],
		});
	}
	async exec(message, { chnl }) {
		const embed = this.client
			.embed()
			.setAuthor(
				message.member.displayName,
				message.author.displayAvatarURL({ dynamic: true })
			);

		if (!chnl)
			return message.util.send(
				embed.setDescription("You didn't give me a channel.").setColor('RED')
			);

		await message.delete();
		message
			.send(
				embed
					.setDescription(
						'Please continue the conversation in <#' + chnl.id + '>'
					)
					.setThumbnail(
						'http://picsmine.com/wp-content/uploads/2017/04/Stop-Meme-stop-now.jpg'
					)
					.setTitle('Off-Topic Conversation!')
					.setColor('RED')
			)
			.then(() => {
				chnl.send(
					embed
						.setDescription(
							'Continuing conversation from <#' + message.channel.id + '>'
						)
						.setThumbnail(
							'http://www.quickmeme.com/img/dc/dc9a3d179c3d7f195c265e7e76f2a330547d096edfebcfa826eb3698d0019a0a.jpg'
						)
						.setTitle('Conversation Moved!')
						.setColor('GREEN')
				);
			});
	}
};
