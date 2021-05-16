const { warn, warnCount } = require('../../Util/Models');
const Command = require('../../Struct/Command.js');
const moment = require('moment');

module.exports = class VerbalWarnCommand extends Command {
	constructor() {
		super('verbalwarn', {
			aliases: ['verbalwarn', 'vw', 'vb'],
			category: 'Staff',
			description: {
				info: 'Verbally warn someone.',
				usage: ['t)verbalwarn User Reason'],
			},
			channel: 'guild',
			staffOnly: true,
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
					description: "You can't warn anybody without providing me an user.",
				},
			});
		if (!reason)
			return message.send({
				embeds: {
					description: "You can't warn someone without a valid reason.",
				},
			});
		if (user.id === message.member.id)
			return message.send({
				embeds: { description: "You can't warn yourself!" },
			});
		if (user.user.bot)
			return message.send({
				embeds: { description: "You can't warn one of my kind." },
			});
		message.delete();

		async function WarnAndReport() {
			let doc = await warnCount.findOne();
			if (!doc) await new warnCount({ num: 1 }).save();
			else if (doc) {
				doc.num++;
				doc.save();
			}

			await new warn({
				mod: message.author.tag,
				user: user.id,
				reason: reason,
				id: doc.num,
				date: moment().format('ll'),
			}).save();

			await message.guild.channels.cache
				.get(client.config.StaffReportChnl)
				.send(
					client
						.embed()
						.setAuthor(
							`${message.author.username}`,
							message.author.displayAvatarURL({ dynamic: true })
						)
						.addField('> **Victim**:', `${user} | ${user.id}`, true)
						.addField('> **Reason**:', reason)
						.setFooter(`Case ID: ${doc.num}`)
				);
			return message.send({
				embeds: {
					description:
						'<@' +
						user +
						'> was **__verbally warned__** for **' +
						reason +
						'**',
					author: {
						name: message.author.username,
						icon_url: message.author.displayAvatarURL({ dynamic: true }),
					},
				},
			});
		}

		let docs = await warn.find({ user: user.id });

		if (docs.length) {
			let str = docs
				.map(
					(d) =>
						`${this.client.arrow} **Case ID**: ${d.id}\n${
							this.client.arrow
						} **Moderator**: ${d.mod}\n${this.client.arrow} **Reason**: ${
							d.reason
						}\n${this.client.arrow} **Date**: ${
							d.date ? d.date : 'No logged date'
						}\n`
				)
				.join('\n');

			let msgs = [];
			let splitted = await client.split(str);
			if (splitted.length == 1) {
				await message
					.send({
						embeds: {
							description: splitted[0],
							author: {
								name: `Past warns of ${user.user.username}`,
								icon_url: user.user.displayAvatarURL({ dynamic: true }),
							},
						},
					})
					.then((m) => msgs.push(m.id));
			} else {
				for (let i = 0; i < splitted.length; i++) {
					await message
						.send({
							embeds: {
								description: splitted[i],
								author: {
									name: `Past warns of ${user.user.username}`,
									icon_url: user.user.displayAvatarURL({ dynamic: true }),
								},
							},
						})
						.then((m) => msgs.push(m.id));
				}
			}

			let msg = await message.send({
				embeds: {
					description: `Do you really want to warn ${user} for \`${reason}\`?`,
					author: {
						name: message.author.username,
						icon_url: message.author.displayAvatarURL({ dynamic: true }),
					},
				},
			});
			await msg.react(this.client.tick);
			await msg.react(this.client.cross);
			try {
				let collected = await msg.awaitReactions(
					(reaction, u) => u.id === message.author.id,
					{
						max: 1,
						time: 15000,
						errors: ['time'],
					}
				);

				if (collected.first().emoji.name === this.client.tick) {
					(await msg.deleted) ? null : msg.delete();
					msgs.forEach(async (m) => {
						await message.channel.messages.fetch(m).then((mm) => mm.delete());
					});
					return WarnAndReport();
				} else if (collected.first().emoji.name === this.client.cross) {
					(await msg.deleted) ? null : msg.delete();
					msgs.forEach(async (m) => {
						await message.channel.messages.fetch(m).then((mm) => mm.delete());
					});
					return message.send({
						embeds: { description: 'Verbal Warn cancelled.' },
					});
				} else
					return message.send({
						embeds: { description: 'Verbal Warn cancelled.' },
					});
			} catch (e) {
				(await msg.deleted) ? null : msg.delete();
				msgs.forEach(async (m) => {
					await message.channel.messages.fetch(m).then((mm) => mm.delete());
				});
				return message.send({
					embeds: {
						description: 'I waited long enough. Verbal Warn cancelled.',
						color: 'RED',
					},
				});
			}
		} else return WarnAndReport();
	}
	async execSlash(message) {
		let user = message.options[0]?.user;
		let reason = message.options[1]?.value;

	    if (!message.member.roles.cache.has(this.client.config.StaffRole)) return message.reply("You can't use this command.", { ephemeral: true })
		if (user.id === message.member.id)
			return message.reply("You can't warn yourself.", { ephemeral: true });

		let doc = await warnCount.findOne();
		if (!doc) await new warnCount({ num: 1 }).save();
		else if (doc) {
			doc.num++;
			doc.save();
		}

		await new warn({
			mod: message.member?.user.tag,
			user: user.id,
			reason: reason,
			id: doc.num,
			date: moment().format('ll'),
		}).save();

		await message.guild.channels.cache
			.get(this.client.config.StaffReportChnl)
			.send(
				this.client
					.embed()
					.setAuthor(
						`${message.member?.user.username}`,
						message.member?.user.displayAvatarURL({ dynamic: true })
					)
					.addField('> **Victim**:', `${user} | ${user.id}`, true)
					.addField('> **Reason**:', reason)
					.setFooter(`Case ID: ${doc.num}`)
			);

		let warnbed = this.client
			.embed()
			.setDescription(
				'<@' + user + '> was **__verbally warned__** for **' + reason + '**'
			)
			.setAuthor(
				message.member?.user.username,
				message.member?.user.displayAvatarURL({ dynamic: true })
			);
		return message.reply(user, warnbed);
	}
};
