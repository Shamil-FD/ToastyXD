const fetch = require("node-fetch");
const urbanDic = require("urban-dictionary");
const Command = require('../../Struct/Command.js');

module.exports = class DictionaryCommand extends Command {
	constructor() {
		super('dictionary', {
			aliases: ['dictionary'],
			category: 'misc',
			channel: 'guild',
			description: {
				info: 'Get a definition of a word. Optional: `urban` - for urban dictionary',
				usage: ['t)dictionary Hello', 't)dictionary urban: sheesh'],
			},
            args: [
                {
                  id: 'urban',
                  match: 'option',
                  flag: 'urban:'
                },
                {
                    id: 'word',
                }
            ]
		});
	}

	async exec(message, { urban, word }) {
        let search;
        let fetched;
        let result = [];
        
        if (urban) search = urban
        else search = word;
        
        if (urban) {
            fetched = await urbanDic.define(search);
            if (!fetched) return message.send({ embeds: { description: `No definitions found for ${search}`, color: 'RED'}});
            fetched = fetched.slice(0, 3);
            
            fetched.forEach((fet) => {
            Object.entries(fet).forEach(([key, prop]) => {
             if (key === "example") prop += "\n"
                
            if (!["thumbs_up", "permalink", "thumbs_down", "defid", "written_on", "author", "word", "sound_urls", "current_vote"].includes(key)) {
    		result.push(`${this.client.arrow} **${key.replace(/(\b\w)/gi, (str) => str.toUpperCase())}**: ${prop}`)
                 }
              });
            })
            return message.send({ embeds: { description: result.join("\n") }})
        } else {
        await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en_GB/${search}`).then(res => res.json()).then(res => fetched = res);
        
        if (fetched?.title === "No Definitions Found") return message.send({ embeds: { description: `No definitions found for ${search}`, color: 'RED'}});

        fetched.forEach(f => {
            result.push(f.meanings.map(m => `${this.client.arrow} **Part Of Speech**: ${m.partOfSpeech}\n${m.definitions.map(d => `${this.client.arrow} **Definition**: ${d.definition}${d.example ? `\n${this.client.arrow} **Example**: ${d.example}` : ''}${d.synonyms ? `\n${this.client.arrow} **Synonyms**: ${d.synonyms.join("\n")}` : '' } `).join("\n")}`).join("\n\n"))
        })
        return message.send({ embeds: { title: search, description: result.join("\n") }})
        }
    }
    async execSlash(message){
        let word;
        let urban;
        if (message.options[0].name === 'normal') word = message.options[0]?.options[0]?.value;
        else if (message.options[0].name === 'urban') urban = message.options[0]?.options[0]?.value;
        
        let search;
        let fetched;
        let result = [];
        
        if (!urban && !word) return message.reply({ embeds: [{ description: "You have to provide me a word to define.", color: 'RED' }], ephemeral: true });
        if (urban) search = urban
        else search = word;
        
        if (urban) {
            try {
            fetched = await urbanDic.define(search);
            } catch(e) {
            return message.reply({ ephemeral: true, embeds: [{ description: `No definitions found for ${search}`, color: 'RED'}]});
            }
            fetched = fetched.slice(0, 3);
            
            fetched.forEach((fet) => {
            Object.entries(fet).forEach(([key, prop]) => {
             if (key === "example") prop += "\n"
                
            if (!["thumbs_up", "permalink", "thumbs_down", "defid", "written_on", "author", "word", "sound_urls", "current_vote"].includes(key)) {
    		result.push(`${this.client.arrow} **${key.replace(/(\b\w)/gi, (str) => str.toUpperCase())}**: ${prop}`)
                 }
              });
            })
            return message.reply({ embeds: [{ title: `Word: ${search}`, description: result.join("\n"), color: 'RANDOM' }]})
        } else {
        await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en_GB/${search}`).then(res => res.json()).then(res => fetched = res);
        
        if (fetched?.title === "No Definitions Found") return message.reply({ ephemeral: true, embeds: [{ description: `No definitions found for ${search}`, color: 'RED'}]});

        fetched.forEach(f => {
            result.push(f.meanings.map(m => `${this.client.arrow} **Part Of Speech**: ${m.partOfSpeech}\n${m.definitions.map(d => `${this.client.arrow} **Definition**: ${d.definition}${d.example ? `\n${this.client.arrow} **Example**: ${d.example}` : ''}${d.synonyms ? `\n${this.client.arrow} **Synonyms**: ${d.synonyms.join("\n")}` : '' } `).join("\n")}`).join("\n\n"))
        })
        return message.reply({ embeds: [{ title: `Word: ${search}`, description: result.join("\n"), color: 'RANDOM' }]})
        }
    }
};
