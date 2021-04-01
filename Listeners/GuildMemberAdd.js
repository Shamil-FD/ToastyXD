const { MessageAttachment } = require('discord.js');
const { Listener } = require('discord-akairo');
const { verif } = require('../Util/Models');
const moment = require('moment');

module.exports = class GuildMemberAddListener extends Listener {
	constructor() {
		super('guildMemberAdd', {
			emitter: 'client',
			event: 'guildMemberAdd',
		});
	}

	async exec(member) {
		// Check If Member Is A Bot
		if (member.user.bot) return;

		// First Time In Help Channel Thing
		if (!this.client.firstTime.has(member.id)) {
			this.client.firstTime.set(member.id, { yes: true });
		}
		// Verification Stuff
		let memberDate = moment(member.user.createdAt);
		let today = moment(Date.now());
		let num = today.diff(memberDate, 'days');

		// Change Their Nickname If It Doesn't Begin With An Alphabet
		if (!member.user.username.match(/^[0-9a-zA-Z]/g)) {
			await member.setNickname('Moderated Nickname');
		}

		let doc = await verif.findOne({ user: member.id });
		let cap = await this.client.captcha();
		await member.roles.add(this.client.config.NotVerifiedRole);
		member.guild.channels.cache.get(this.client.config.StaffReportChnl).send(
			this.client
				.embed()
				.setDescription(
					`User:   ${member.user.tag} | ${member.id}\nDate: ${moment(
						member.user.createdAt
					)}\nTotal Days: ${num}`
				)
				.setTitle('New Member')
		);

		if (!doc) {
			await new verif({ user: member.id, code: cap.word, count: 0 }).save();

			return await member.guild.channels.cache
				.get('801877313855160340')
				.send(
					this.client
						.embed()
						.setDescription(
							"Please type in the code shown to the command t)verify, for example, t)verify PPSMOL. If you can't read the code, please run t)newcode to get a new code."
						)
						.setColor('#d772e0')
						.setFooter('Codes Are CaSe SenSitIvE')
						.attachFiles(new MessageAttachment(cap.png, 'verify.png'))
				);
		} else {
			doc.code = cap.word;
			await doc.save();

			return await member.guild.channels.cache
				.get('801877313855160340')
				.send(
					member,
					this.client
						.embed()
						.setDescription(
							"Please type in the code shown to the command t)verify, for example, t)verify PPSMOL. If you can't read the code, please run t)newcode to get a new code."
						)
						.setColor('#d772e0')
						.setFooter('Codes Are CaSE SenSitIvE')
						.attachFiles(new MessageAttachment(cap.png, 'verify.png'))
				);
		}
	}
};
