const Command = require('../../Struct/Command.js');
const {verif} = require('../../Util/Models');
const {MessageAttachment} = require('discord.js');

module.exports = class NewCodeCommand extends Command {
	constructor() {
		super('newcode', {
			aliases: ['newcode'],
			category: 'Verification',
			channel: 'guild',
			cooldown: 3000,
			description: {
				info: "Use this command if you don't have a code to verify.",
				usage: ['t)newcode'],
			},
		});
	}

	async exec(message) {
		// Check For The Not Verified Role
		if (!message.member.roles.cache.get(this.client.config.NotVerifiedRole))
			return message.send({ embeds: [
				this.client.embed().setDescription("You're already verified."),
                ]});

		let doc = await verif.findOne({user: message.author.id});
		let cap = await this.client.captcha();
		if (!doc) {
			await new verif({
				user: message.author.id,
				code: cap.word,
				count: 0,
			}).save();

			return message.send({ embeds: [
				this.client
					.embed()
					.setDescription(
						'**Please type in the code shown in the image above.\nExample: `t)verify PPSMOL`\n\nIf the code is not readable, then please make a new one.**',
					)
					.setColor('#d772e0')
					.attachFiles(new MessageAttachment(cap.png, 'verify.png')),
                ]});
		} else {
			doc.code = cap.word;
			await doc.save();

			return message.send({ embeds: [
				this.client
					.embed()
					.setDescription(
						'**Please type in the code shown in the image above.\nExample: `t)verify PpSmoL`. The code is case sensitive!\n\nIf the code is not readable, then please make a new one with `t)newcode`.**',
					)
					.setColor('#d772e0')
					.attachFiles(new MessageAttachment(cap.png, 'verify.png')),
                ]});
		}
	}
};
