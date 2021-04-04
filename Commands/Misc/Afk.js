const Command = require('../../Util/Command.js');
let { afk } = require('../../Util/Models');
let moment = require('moment');

module.exports = class AFKCommand extends Command {
	constructor() {
		super('afk', {
			aliases: ['afk'],
			category: 'misc',
			channel: 'guild',
			cooldown: 10000,
			args: [
				{
					id: 'reason',
					match: 'rest',
					default: 'AFK',
				},
			],
		});
	}

	async exec(message, { reason }) {
		const doc = await afk.findOne({ user: message.author.id });

		if (doc) {
			let a = moment(doc.date);
			let b = moment().format();
			let pingbed = this.client
				.embed()
				.setDescription(
					`${message.author}, glad to see you back!\nYou were pinged ${
						doc.count
					} times. You were AFK for ${a.from(b, true)}`
				);

			if (doc.count > 1)
				pingbed.addField(
					'Jump to Message(s) That Pinged You',
					doc.pings.join('\n')
				);
			doc.delete();
			return message.send(pingbed);
		} else {
			await new afk({
				user: message.author.id,
				count: 0,
				date: moment().format(),
				reason: reason,
			}).save();

			message.channel
				.send(
					this.client
						.embed()
						.setDescription(`${message.author} is now AFK: ${reason}`)
				)
				.then((msg) => {
					setTimeout(() => {
						message.delete();
					}, 15000);
				});
		}
	}
};
