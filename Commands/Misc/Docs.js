const Command = require('../../Util/Command');
const { MessageEmbed } = require('discord.js');
const phin = require('phin');

module.exports = class DocsCommand extends Command {
	constructor() {
		super('docs', {
			aliases: ['docs', 'djs'],
			category: 'misc',
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
		if (!query)
			return message.send({
				embeds: {
					description: `Specify something to search for.`,
					color: 'RED',
				},
			});
		if (!src) {
			const data = await phin({
				url: `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(
					query
				)}`,
				method: 'get',
				parse: 'json',
			});
            if(data.body == null) return message.send({ embeds: { description: 'Nothing found for that!', color: 'RED' }})
			return message.send(new MessageEmbed(data.body));
		} else if (src) {
			const data = await phin({
				url: `https://djsdocs.sorta.moe/v2/embed?src=${src}&q=${encodeURIComponent(
					query
				)}`,
				method: 'get',
				parse: 'json',
			});
            if(data.body == null) return message.send({ embeds: { description: 'Nothing found for that!', color: 'RED' }})
			return message.send(new MessageEmbed(data.body));
		}
	}
};
