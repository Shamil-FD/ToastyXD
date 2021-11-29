const Command = require('../../structure/SlashCommand');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class DocsCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'docs',
        description: 'Search Discord.JS & Discord Akairo docs', 
        category: 'Information',
        help: {
            usage: ['docs <query> [src]'],            
            example: ['docs client master']
        },
        options: [{ name: 'query', type: 'STRING', description: 'The query.', required: true }, { name: 'source', type: 'STRING', description: 'The source of the query you\'re searching.', choices: [{ name: 'collection', value: 'collection' }, { name: 'stable', value: 'stable' }, { name: 'master', value: 'master' }, { name: 'discord_akairo', value: 'akairo-master' }] }]        
      });
    }
    async run(message, options) {
        const src = options.get('source')?.value || 'stable'       
        let data = await fetch(`https://djsdocs.sorta.moe/v2/embed?src=${src}&q=${encodeURIComponent(options.get('query')?.value)}`).then(res => res.json());
        
        if (data == null || !data.description) return message.reply({ embeds: [{ description: 'Nothing found for that!', color: 'RED' }] });
        if (options.get('query')?.value.toLowerCase() === 'client') {
            delete data["fields"];
        }
        
        return message.reply({ embeds: [new MessageEmbed(data)] });        
    }
}