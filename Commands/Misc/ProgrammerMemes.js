const imageapi = require('imageapi.js');
const Command = require('../../Util/Command.js');

module.exports = class MemeCommand extends Command {
	constructor() {
		super('programmingmemes', {
			aliases: ['meme', 'programmermemes', 'programmer'],
			category: 'misc',
			channel: 'guild',
		});
	}

	async exec(message) {
        const meme = await imageapi.advanced('programmerhumor', 'top');
        message.send(this.client.embed().setTitle(meme.title).setAuthor(`u/${meme.author}`).setDescription(`${meme?.text || 'I\'m laughing, you?'}`).setImage(meme.img))
    }
};
