const customParseFormat = require('dayjs/plugin/customParseFormat');
const { leave, staff } = require('../../Util/Models');
const Command = require('../../Struct/Command.js');
const dayjs = require('dayjs');
dayjs.extend(customParseFormat);

module.exports = class LeaveCommand extends Command {
	constructor() {
		super('leave', {
			aliases: ['leave'],
			category: 'Staff',
			channel: 'guild',
			staffOnly: true,
			useSlashCommand: true,
			description: {
				info: 'Start or End an inactive notice. Date Format: DD/MM/YYYY OR DD/MM/YY OR DD-MM-YYYY OR DD-MM-YY',
				usage: ['t)leave stop', 't)leave Start-Date End-Date Reason'],
			},
			args: [
				{ id: 'stop', match: 'flag', flag: 'stop' },
				{ id: 'start' },
				{ id: 'end' },
				{ id: 'reason', match: 'rest' },
			],
			slashCommand: {
				options: [
					{
						name: 'start',
						description: 'Start your leave by using me!!',
						type: 'SUB_COMMAND',
						options: [
							{
								name: 'start',
								description: 'The start date.',
								required: true,
								type: 'STRING',
							},
							{
								name: 'end',
								description: 'The end date.',
								required: true,
								type: 'STRING',
							},
							{
								name: 'reason',
								description: "Why you leaving us? I'm sad.",
								type: 'STRING',
								required: true,
							},
						],
					},
					{
						name: 'end',
						description: 'End your leave, yay!',
						type: 'SUB_COMMAND',
					},
				],
			},
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
			let Start = start.slice(6);
			let End = end.slice(6);

			if (Start.length == 4) {
				start = dayjs(start, 'DD/MM/YYYY');
			} else {
				start = dayjs(start, 'DD/MM/YY');
			}
			if (End.length == 4) {
				end = dayjs(end + ' 06:01', 'DD/MM/YYYY HH:mm');
			} else {
				end = dayjs(end + ' 06:01', 'DD/MM/YY HH:mm').add(1, 'day');
			}

			if (!start.isValid() || !end.isValid())
				return message.send({
					embeds: {
						description:
							this.client.arrow +
							" One of the provided date was invalid. This could be because you didn't use the proper date format, which is `DD/MM/YY` or `DD/MM/YYYY`. You have to add 0 infront if the day/month is a single digit.",
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
						.setFooter('Bye, see you soon ig')
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
				return message.send({
					embeds: {
						description: "You weren't on leave.",
						color: 'RED',
						title: 'Nope',
					},
				});
			await doc.delete();
			await message.send({
				embeds: {
					description: "You're not on leave anymore.",
					color: 'GREEN',
					title: 'Welcome back!',
				},
			});
		}
		message.deleted ? null : message.delete();
	}
	async execSlash(message) {
		message.defer();
		if (message.options[0]?.name === 'end') {
			let doc = await leave.findOne({ user: message.member?.id });
			if (!doc)
				return message.editReply(
					this.client.embed().setDescription("You weren't on leave, dummy.")
				);
			await doc.delete();
			return message.editReply(
				this.client.embed().setTitle('Hey!').setDescription('Welcome back! :D')
			);
		} else {
			let start = message.options[0]?.options[0]?.value;
			let end = message.options[0]?.options[1]?.value;
			let reason = message.options[0]?.options[2]?.value;

			let cumStart = start.slice(6);
			let cumEnd = end.slice(6);

			if (cumStart.length == 4) {
				start = dayjs(start, 'DD/MM/YYYY');
			} else {
				start = dayjs(start, 'DD/MM/YY');
			}
			if (cumEnd.length == 4) {
				end = dayjs(end + ' 00:00', 'DD/MM/YYYY HH:mm');
			} else {
				end = dayjs(end + ' 06:00', 'DD/MM/YY HH:mm').add(1, 'day');
			}
			if (!start.isValid() || !end.isValid())
				return message.editReply(
					"One of the provided date was invalid. This could be because you didn't use the proper date format, which is `DD/MM/YY` or `DD/MM/YYYY`. You have to add 0 infront if the day/month is a single digit."
				);

			let doc = await leave.findOne({ user: message.member?.id });
			let onLeave = await staff.findOne({ user: message.member?.id });
			if (onLeave) {
				onLeave.onLeave = true;
				await onLeave.save();
			}
			if (!doc) {
				await new leave({
					user: message.member?.id,
					start: start,
					end: end,
					reason: reason,
				}).save();
			} else {
				doc.start = start;
				doc.end = end;
				doc.reason = reason;
				await doc.save();
			}

			message.editReply(this.client.tick);
			return message.guild.channels.cache.get('757169784747065364').send(
				this.client
					.embed()
					.setAuthor(
						message.member?.user?.username,
						message.member?.user?.displayAvatarURL({ dynamic: true })
					)
					.addField('Reasoning:', reason)
					.addField('Starting On:', dayjs(start).format('DD MMMM YYYY'), true)
					.addField('Ending By:', dayjs(end).format('DD MMMM YYYY'))
					.setDescription(`Byeee ${message.member}!`)
			);
		}
	}
};
