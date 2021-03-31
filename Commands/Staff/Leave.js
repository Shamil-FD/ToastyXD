const customParseFormat = require('dayjs/plugin/customParseFormat');
const { leave, staff } = require('../../Util/Models');
const Command = require('../../Util/Command.js');
const dayjs = require('dayjs');
dayjs.extend(customParseFormat);

module.exports = class LeaveCommand extends Command {
	constructor() {
		super('leave', {
			aliases: ['leave'],
			category: 'Staff',
			channel: 'guild',
			staffOnly: true,
			args: [
				{ id: 'stop', match: 'flag', flag: 'stop' },
				{ id: 'start' },
				{ id: 'end' },
				{ id: 'reason', match: 'rest' },
			],
		});
	}

	async exec(message, { stop, start, end, reason }) {
		let client = this.client;

		if (!stop) {
			// Invalid Format Message
			if (!start || !end || !reason)
				return message.send(
					client
						.embed()
						.setDescription(
							':x: Invalid format. `DD/MM/YY`\n```t)leave 11/11/20 11/11/21 Goodbye Shamil```\n`t)leave stop`'
						)
				);

			// Time validation
			start = dayjs(start, 'DD/MM/YY');
			end = dayjs(end + ' 00:00', 'DD/MM/YY HH:mm');
			if (!start.isValid() || !end.isValid())
				return message.send(message.author, {
					embeds: {
						description:
							this.client.arrow +
							' Invalid command usage. `DD/MM/YY`\nProper Usage: `t)leave 11/11/20 11/11/21 I will miss you guys.`\n`t)leave stop`',
						title: 'Invalid Usage',
						color: 'RED',
					},
				});

			let doc = await leave.findOne({ user: message.author.id });
			let onLeave = await staff.findOne({ user: message.author.id });
			if (onLeave) {
				onLeave.onLeave = true;
				await onLeave.save();
			}
			if (!doc) {
				await new leave({
					user: message.author.id,
					start: start,
					end: end,
					reason: reason,
				}).save();
				// Send Message to Inactive Notice Channel
				await message.guild.channels.cache.get('757169784747065364').send(
					client
						.embed()
						.setAuthor(
							message.author.username,
							message.author.displayAvatarURL()
						)
						.setDescription(
							`${message.author} is now on leave.\nStart Date: ${dayjs(
								start
							).format('DD MMMM YYYY')} - End Date: ${dayjs(end).format(
								'DD MMMM YYYY'
							)} - Reason: ${reason}`
						)
						.setFooter("We'll miss you <3")
				);
			} else {
				// Update Document
				doc.start = start;
				doc.end = end;
				doc.reason = reason;
				await doc.save();

				// Send Message to Inactive Notice Channel
				await message.guild.channels.cache.get('757169784747065364').send(
					client
						.embed()
						.setAuthor(
							message.author.username,
							message.author.displayAvatarURL()
						)
						.setDescription(
							`${message.author} is now on leave.\nStart Date: ${dayjs(
								start
							).format('DD MMMM YYYY')} - End Date: ${dayjs(end).format(
								'DD MMMM YYYY'
							)} - Reason: ${reason}`
						)
				);
			}
		} else {
			let doc = await leave.findOne({ user: message.author.id });
			if (!doc)
				return message.send(message.author, {
					embeds: {
						description: "You aren't on leave.",
						color: 'RED',
						title: 'Nope',
					},
				});
			await doc.delete();
			return message.send(message.author, {
				embeds: {
					description: "You're not on leave anymore.",
					color: 'GREEN',
					title: 'Welcome back!',
				},
			});
		}
	}
};
