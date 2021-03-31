const { Listener } = require('discord-akairo');
const models = require('../Util/Models.js');
const moment = require('moment');

module.exports = class MessageListener extends Listener {
	constructor() {
		super('message', {
			emitter: 'client',
			event: 'message',
		});
	}

	async exec(message) {
		let { guild } = message;
		if (message.author.bot) return;

		// Inform Someone Who Just Joined A Few Rules About Help Channels.
		if (
			message.channel.id === '709043365727043588' ||
			message.channel.id === '709043414053814303'
		) {
			if (this.client.firstTime.has(message.author.id)) {
				await this.client.firstTime.delete(message.author.id);
				await message.send(
					`${message.author}, Welcome to the help channel. Please make sure to follow these basic rules when asking for help:\n1. Do not ask/beg for source code. We don't give out source codes.\n\n2. Don't ping anyone for help.\n\n3. Do not ask for help in DMs.\n\n4. When posting code/errors post them in a source code bin. Links can be found by running the command \`s!bins\`\n\n5. Be patient, people have a life outside of the internet.\n6. Don't ask to get help, if have a question, post your question with code and errors if any.`
				);
			}
		}

		// Promoting The PasteCode Command :)
		if (
			message.content.startsWith('s!bins') ||
			message.content.startsWith('s!bin')
		) {
			message.channel.send(
				this.client
					.embed()
					.setDescription(
						'Tired of going to the bin sites to paste your code? Try our all new `t)pc` command! You can either send your code to save it to a bin OR if your code is over the Discord character limit ( 2000 chars ) you can send a txt file instead! How cool is that?'
					)
					.setAuthor(
						message.author.username,
						message.author.displayAvatarURL({ dynamic: true })
					)
			);
		}

		if (message.channel.type === 'text') {
			// Help Me Message
			let helparr = [
				'why cant i type in the help channel',
				'my code doesnt work',
				'my code does not work',
				'i cant send message',
				'video didnt work',
				'code doesnt work',
				'code dont work',
				"i can't type in help",
				'help channel locked',
				'i cant type in help',
				'how to get access to help',
				'how to get help',
				"can't speak in help",
				'can someone help me',
			];
			if (!message.member.roles.cache.get('751032945648730142')) {
				let dontaskagain = false;
				helparr.map((r) => {
					if (dontaskagain === false) {
						if (message.content.toLowerCase().includes(r.toLowerCase())) {
							message.send({
								embeds: {
									description:
										"Oh you need help? Well, you gotta earn it by yourself.\n\n> WhY dO I nEeD tO lEvEl uP?!\nWell, you see, we spend our time to help you, but after then, you'll just leave server, which is unfair. Because we gave you your answer, but you can't help us by staying and being active in the server.\n\n> HoW dO I EARn IT ThEn?!\n\nNumber OOOOne: Conversate in the chatting channels.\nNumber Tooo: Conversate moore.\nNumber Treee: Get to level **1**. You can check your level by typing in the command `a!rank` in the bot commands channel.\n\n> HoW lOnG wIlL iT tAkE!?\n\nDepends on you. Realisticly it should only take 2 minuuutes.",
								},
							});
							dontaskagain = true;
						}
					}
				});
			}

			// AFK Stuff, Check For Pings, Turn Off AFK ETC
			let afksdoc = await models.afk.findOne({ user: message.author.id });

			if (afksdoc) {
				let a = moment(afksdoc.date);
				let b = moment().format();
				let pingbed = this.client
					.embed()
					.setDescription(
						`${message.author}, glad to see you back!\n${
							afksdoc.count > 0 ? `You were pinged ${afksdoc.count} times.` : ''
						} You were AFK for ${a.from(b, true)}`
					);

				// Add A Field If There's Pings
				if (afksdoc.count > 0)
					pingbed.addField(
						'Jump to Message(s) That Pinged You',
						afksdoc.pings.join('\n')
					);

				await models.afk
					.findOneAndDelete({ user: message.author.id })
					.then(
						message.channel
							.send(pingbed)
							.then((msg) => msg.delete({ timeout: 120000 }))
					);
			}

			// Check If The Author Pinged An AFK Member And Then Inform The Author That They Are AFK
			if (message.mentions.members.first()) {
				let afkdoc = await models.afk.findOne({
					user: message.mentions.members.first().id,
				});

				if (afkdoc) {
					afkdoc.count++;
					afkdoc.pings.push(
						`From ${message.author.tag} - [Jump](` + message.url + ')'
					);
					await afkdoc.save();
					let a = moment(afkdoc.date);
					let b = moment().format();
					return message.channel.send(
						message.author,
						this.client
							.embed()
							.setDescription(
								`${message.mentions.members.first()} has been AFK for ${a.from(
									b,
									true
								)}\nReason: ${afkdoc.reason}`
							)
							.setFooter('PINGS!')
					);
				}
			}
		}
	}
};
