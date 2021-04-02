const { Listener } = require('discord-akairo');

module.exports = class StaffMessageListener extends Listener {
	constructor() {
		super('StaffMessage', {
			emitter: 'client',
			event: 'message',
		});
	}

	async exec(message) {
		let models = this.client.models;
		if (message.author.bot === true) return;
		function rannum() {
			return Math.floor(Math.random() * 30 + 11);
		}
		// Check If Channel Is A Guild Channel
		if (message.channel.type === 'text') {
			// Staff Check-In Stuff
			if (message.member.roles.cache.has('752632482943205546') === true) {
				let doc = await models.staff.findOne({ user: message.author.id });

				if (!doc) {
					await new models.staff({
						user: message.author.id,
						msgs: 1,
						dailyCount: rannum(),
						total: 1,
						strikes: 0,
					}).save();
				} else {
					doc.msgs++;
					doc.total ? doc.total++ : (doc.total = 1);
					await doc.save();
				}
				doc = await models.staff.findOne({ user: message.author.id });
				// If A Staff's Total Message Count Is Equal To Or Greater Than Their Daily Message Count Then Execute These
				if (doc.msgs > doc.dailyCount) {
					let clockchnl = await message.guild.channels.cache.get(
						'733307358070964226'
					);

					// Fetching The Clocked In Message
					await clockchnl.messages
						.fetch('777522764525338634')
						.then(async (msgs) => {
							// Add The Staff Into The Checked In Message If They Aren't There
							if (!msgs.embeds[0].description.includes(message.author.tag)) {
								await msgs.edit(
									this.client
										.embed()
										.setDescription(
											msgs.embeds[0].description +
												`\n${this.client.tick} ${message.author.tag} - ${doc.dailyCount} messages today`
										)
										.setColor('GREEN')
										.setFooter(
											msgs.embeds[0].footer ? msgs.embeds[0].footer.text : ''
										)
								);
							}
						});

					// Fetching The Not Clocked In Message
					const NotCheckedIn = await clockchnl.messages.fetch(
						'804073813163376650'
					);
					// Remove The Staff From The Not Checked In Message If They Are There
					if (NotCheckedIn.embeds[0].description.includes(message.author.tag)) {
						let ReplacedMsg = NotCheckedIn.embeds[0].description.replace(
							`:x: ${message.author.tag}`,
							''
						);
						ReplacedMsg = ReplacedMsg.replace(/(^[ \t]*\n)/gm, '');
						NotCheckedIn.edit(
							this.client.embed().setDescription(ReplacedMsg).setColor('RED')
						);
					}
				}
			}
		}
	}
};
