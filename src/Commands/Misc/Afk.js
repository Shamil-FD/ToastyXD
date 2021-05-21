const Command = require('../../Struct/Command.js');
let { afk } = require('../../Util/Models');
let moment = require('moment');
let ms = require('ms');

module.exports = class AFKCommand extends Command {
	constructor() {
		super('afk', {
			aliases: ['afk'],
			category: 'misc',
			channel: 'guild',
			description: {
				info: 'Set your AFK status. Optional: `mute` - for muting yourself for a certain time.',
				usage: ['t)afk 1 year', 't)afk mute: 10m this is hard'],
			},
			cooldown: 10000,
			args: [
				{
					id: 'mute',
					match: 'option',
					flag: 'mute:',
				},
				{
					id: 'reason',
					match: 'rest',
					default: 'be back soon xoxo',
				},
			],
		});
	}

	async exec(message, { mute, reason }) {
		const doc = await afk.findOne({ user: message.author.id });

		if (!doc) {
			if (mute) {
				mute = await ms(mute);
				if (!mute)
					return message.send({
						embeds: { description: 'Invalid time provided.' },
					});
				await message.member.roles.add(
					await message.guild.roles.fetch(this.client.config.MutedRole)
				);
			}
			await new afk({
				user: message.author.id,
				count: 0,
				date: moment().format(),
				reason: reason,
				muteDate: Date.now(),
				muteTime: mute,
			}).save();

			let mutebed = this.client
				.embed()
				.setDescription(`${message.author} is now AFK: ${reason}`);
			if (mute) {
				mutebed.setFooter('Will be unmuted at');
				mutebed.setTimestamp(new Date(Date.now() + mute));
			}
			message.send(mutebed).then((msg) => {
				setTimeout(() => {
					message.delete();
				}, 15000);
			});
		}
	}
	async execSlash(message) {
		const doc = await afk.findOne({ user: message.member.id });
		let reason = message.options[0]?.value || 'be back soon xo';
		let mute = message.options[1]?.value;
		message.defer();

		if (!doc) {
			if (mute) {
				mute = await ms(mute);
				if (!mute)
					return message.editReply({
						ephemeral: true,
						embeds: [{ description: 'Invalid time provided.' }],
					});
				await message.member.roles.add(
					await message.guild.roles.fetch(this.client.config.MutedRole)
				);
			}
			await new afk({
				user: message.member.id,
				count: 0,
				date: moment().format(),
				muteTime: mute,
				muteDate: Date.now(),
				reason: reason,
			}).save();

			let mutebed = this.client
				.embed()
				.setDescription(`<@${message.member.id}> is now AFK: ${reason}`);
			if (mute) {
				mutebed.setFooter('Will be unmuted at');
				mutebed.setTimestamp(new Date(Date.now() + mute));
			}
			return message.editReply(mutebed);
		}
	}
};
