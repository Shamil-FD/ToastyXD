const Command = require('../../Util/Command');
const phin = require('phin');

class DocsCommand extends Command {
	constructor() {
		super('docs', {
			aliases: ['docs', 'djs'],
			category: 'Misc',
			flags: ['--src'],
			channel: 'guild',

			args: [
				{
					id: 'query',
					type: 'string',
					match: 'rest',
				},
				{
					id: 'src',
					match: 'option',
					flag: '--src=',
				},
			],
		});
	}
	async exec(message, { query, src }) {
		if (!query) return message.send(`Specify something to search for.`);
		if (!src) {
			const data = await phin({
				url: `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(
					query
				)}`,
				method: 'get',
				parse: 'json',
			});
			return message.send({ embed: data.body });
		} else if (src) {
			const data = await phin({
				url: `https://djsdocs.sorta.moe/v2/embed?src=${src}&q=${encodeURIComponent(
					query
				)}`,
				method: 'get',
				parse: 'json',
			});
			return message.send({ embed: data.body });
		}
	}
}

module.exports = DocsCommand;
