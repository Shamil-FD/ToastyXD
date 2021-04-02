const Command = require('../../Util/Command.js');
const { warn } = require('../../Util/Models.js');

module.exports = class WarningsCommand extends Command {
	constructor() {
		super('warnings', {
			aliases: ['warnings', 'warns'],
			category: 'Staff',
			channel: 'guild',
			staffOnly: true,
			prefix: ['t)', '-'],
			args: [{ id: 'user', match: 'rest' }],
		});
	}

	async exec(message, { user }) {
		let client = this.client;
		user = await message.getMember(user);
		if (!user)
			return message.send(
				this.client.embed().setDescription(`I couldn't find \`${user}\``)
			);

		let doc = await warn.find({ user: user.id });
		if (!doc.length)
			return message.send(
				this.client.embed().setDescription(`${user} hasn't been warned before.`)
			);

		let embed = this.client.embed();
		let str = await doc
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
							name: `Warns of ${user.user.username} | ${doc.length} Warns`,
							iconURL: user.user.displayAvatarURL({ dynamic: true }),
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
								name: `Warns of ${user.user.username} | ${doc.length} Warns`,
								iconURL: user.user.displayAvatarURL({ dynamic: true }),
							},
						},
					})
					.then((m) => msgs.push(m.id));
			}
		}

		let msg = await message.send({
			embeds: {
				description: 'React to delete these message(s).',
				color: 'GREEN',
			},
		});
		try {
			await msg.react(client.tick);
			let collected = await msg.awaitReactions(
				(reaction, u) => u.id === message.author.id,
				{
					max: 1,
					time: 120000,
					errors: ['time'],
				}
			);
			if (collected.first().emoji.name === client.tick) {
				msgs.forEach(async (m) => {
					message.channel.messages.fetch(m).then((mm) => mm.delete());
				});
				message.delete();
				return msg.delete();
			}
		} catch (e) {
			return msg.delete();
		}
	}
};
