const { MessageAttachment } = require('discord.js');
const { Listener } = require('discord-akairo');
const { firstTime, verif } = require('../Util/Models');
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
		let FirstTimeDoc = await firstTime.findOne({ id: member.id });
		if (!FirstTimeDoc) {
			await new firstTime({ id: member.id }).save();
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
		if (parseInt(num) < 2) {
			await member
				.send('Your account is too new to join our server.')
				.catch((e) => {});
			await member.ban({ reason: 'Account age under 2 days.' });
			return member.guild.channels.cache
				.get(this.client.config.StaffReportChnl)
				.send(
					this.client
						.embed()
						.setDescription(
							`User: ${member.user.tag} | ${member.id}\nCreation Date: ${moment(
								member.user.createdAt
							)}\nTotal Days Since Creation: ${num}\nBanned For: Account age under 2 days.`
						)
						.setTitle('Member Banned')
				);
		}
		member.guild.channels.cache.get(this.client.config.StaffReportChnl).send(
			this.client
				.embed()
				.setDescription(
					`User:   ${member.user.tag} | ${member.id}\nCreation Date: ${moment(
						member.user.createdAt
					)}\nTotal Days Since Creation: ${num}`
				)
				.setTitle('New Member')
		);

		if (!doc) {
			await new verif({ user: member.id, code: cap.word, count: 0 }).save();

			return await member.guild.channels.cache
				.get('801877313855160340')
				.send(
					`<@${member.id}>`,
					this.client
						.embed()
						.setDescription(
							'**Please type the code shown in the image above using the command `t)verify Code`\nIf the code is too hard to read, use the command `t)newcode` to get a new one.**'
						)
						.setColor('#d772e0')
						.attachFiles(new MessageAttachment(cap.png, 'verify.png'))
				);
		} else {
			doc.code = cap.word;
			await doc.save();

			return await member.guild.channels.cache
				.get('801877313855160340')
				.send(
					`<@${member.id}>`,
					this.client
						.embed()
						.setDescription(
							'**Please type the code shown in the image above using the command `t)verify Code`\nIf the code is too hard to read, use the command `t)newcode` to get a new one.**'
						)
						.setColor('#d772e0')
						.attachFiles(new MessageAttachment(cap.png, 'verify.png'))
				);
		}
	}
};
