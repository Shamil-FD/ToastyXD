const Command = require('../../Util/Command.js');

module.exports = class HelpMeCommand extends Command {
	constructor() {
		super('helpme', {
			aliases: ['helpme'],
			category: 'misc',
			channel: 'guild',
		});
	}

	async exec(message) {
		const arr = [
			'help AH',
			'I need help rn',
			"I need help I don't have much time!",
			'please help, please!',
			'hey, can you help me?',
			"why can't i access help channels?",
			'can someone help pls',
			'halp pwease',
			'guys, help me',
			'give me access to help channels',
			"Help i'm in a hurry!",
		];
		message.delete();
		return message.send(
			this.client
				.embed()
				.setDescription(
					"Oh you need help? Well, you gotta earn it by yourself.\n\n> WhY dO I nEeD tO lEvEl uP?!\nWell, you see, we spend our time to help you, but after then, you'll just leave server, which is unfair. Because we gave you your answer, but you can't help us by staying and being active in the server.\n\n> HoW dO I EARn IT ThEn?!\n\nNumber OOOOne: Conversate in the chatting channels.\nNumber Tooo: Conversate moore.\nNumber Treee: Get to level **1**. You can check your level by typing in the command `a!rank` in the bot commands channel.\n\n> HoW lOnG wIlL iT tAkE!?\n\nDepends on you. Realisticly it should only take 2 minuuutes."
				)
				.setTitle(arr[Math.round(Math.random() * arr.length)])
		);
	}
};
