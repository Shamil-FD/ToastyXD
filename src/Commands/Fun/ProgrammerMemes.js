const imageapi = require('imageapi.js');
const Command = require('../../Struct/Command.js');

module.exports = class MemeCommand extends Command {
	constructor() {
		super('meme', {
			aliases: ['meme', 'programmermemes', 'programmer'],
			category: 'fun',
			channel: 'guild',
			useSlashCommand: true,
		});
	}

	async exec(message) {
		const meme = await imageapi.advanced('programmerhumor', 'top');
		message.send(
			this.client
				.embed()
				.setTitle(meme.title)
				.setAuthor(`u/${meme.author}`)
				.setDescription(`${meme?.text || "I'm laughing, you?"}`)
				.setImage(meme.img)
		);
	}
	async execSlash(message) {
		message.defer();
		const meme = await imageapi.advanced('programmerhumor', 'top');
		return message.editReply({
			embeds: [
				{
					color: 'RANDOM',
					title: meme.title,
					description:
						meme?.text ??
						'Lame meme provided by the lame [ImageAPI](https://npmjs.com/package/imageapi.js) package.',
					image: { url: meme?.img },
				},
			],
		});
	}
};
