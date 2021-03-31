const Command = require('../../Util/Command.js');
const { verif } = require('../../Util/Models');
const { MessageAttachment } = require('discord.js');

module.exports = class NewCodeCommand extends Command {
	constructor() {
		super('newcode', {
			aliases: ['newcode'],
			category: 'Verification',
			channel: 'guild',
			cooldown: 3000,
		});
	}

	async exec(message) {
		// Check For The Not Verified Role
		if (!message.member.roles.cache.get(this.client.config.NotVerifiedRole))
			return message.send(
				this.client.embed().setDescription("You're already verified.")
			);

		let doc = await verif.findOne({ user: message.author.id });
		let cap = await this.client.captcha();
		if (!doc) {
			await new verif({
				user: message.author.id,
				code: cap.word,
				count: 0,
			}).save();

			return message.channel.send(
				message.author,
				this.client
					.embed()
					.setDescription(
						'Please type in the code shown in the image.\nExample: `t)verify PPSMOL`\n\nIf the code is not readable, then please make a new one.'
					)
					.setFooter('Codes Are CaSe SeNSiTiVE')
					.setColor('#d772e0')
					.attachFiles(new MessageAttachment(cap.png, 'verify.png'))
			);
		} else {
			doc.code = cap.word;
			await doc.save();

			return message.channel.send(
				message.author,
				this.client
					.embed()
					.setDescription(
						'Please type in the code shown in the image.\nExample: `t)verify PPSMOL`\n\nIf the code is not readable, then please make a new one.'
					)
					.setFooter('Codes Are CaSe SeNSiTiVE')
					.setColor('#d772e0')
					.attachFiles(new MessageAttachment(cap.png, 'verify.png'))
			);
		}
	}
};
