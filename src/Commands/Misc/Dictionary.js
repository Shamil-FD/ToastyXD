// prettier-ignore
const fetch = require('node-fetch');
const normalDic = require('owlbot-js');
const urbanDic = require('urban-dictionary');
const Command = require('../../Struct/Command.js');
const { MessageButton, MessageActionRow } = require('discord.js');

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
      useSlashCommand: true,
      slashCommand: {
        description: 'Get a definition of a word.',
        options: [
          {
            name: 'normal',
            description: 'Search the official dictionary',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'word',
                description: 'The word that you want the definition of.',
                required: true,
                type: 'STRING',
              },
            ],
          },
          {
            name: 'urban',
            description: 'Search the urban dictionary',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'word',
                description: 'The word that you want the definition of.',
                required: true,
                type: 'STRING',
              },
            ],
          },
        ],
      },
      args: [
        {
          id: 'urban',
          match: 'option',
          flag: 'urban:',
        },
        {
          id: 'word',
        },
      ],
    });
  }

  async exec(message, { urban, word }) {
    // Variables  
    let search;
    let fetched;
    let result = [];

    if (!urban && !word) return message.reply({ embeds: [this.client.tools.embed().setDescription('You have to provide a word to define!\n\n**Examples**:\n• t)dictionary Hello\n• t)dictionary urban: sheesh')] });
    if (urban) search = urban;
    else search = word;
    return this.handleSearching(fetched, urban, search, message);
   }
  async execSlash(message) {
    // Variables
    let word;
    let urban;
    if (message.options.getSubcommand() === 'normal') word = message.options.get('word').value;
    else if (message.options.getSubcommand() === 'urban') urban = message.options.get('word').value;

    let search;
    let fetched;
    let result = [];

    if (!urban && !word)
      return message.reply({ 
          embeds: [this.client.tools.embed().setDescription('You have to provide me a word to define.').setColor('RED')], 
          ephemeral: true,
      });
    if (urban) search = urban;
    else search = word;
    return this.handleSearching(fetched, urban, search, message);
  }
   async handleSearching(fetched, urban, search, message) {  
    if (urban) {
      try {
        fetched = await urbanDic.define(search);
      } catch (e) {
        return message.reply({
          ephemeral: true,
          embeds: [this.client.tools.embed().setDescription(`No definitions found for ${search}`).setColor('RED')],
        });
      }
           
    if (fetched.length > 1) {
        return this.handlePages(message, fetched, search, urban);
    } else {        
        return message.reply({ embeds: [this.client.tools.embed().setTitle(`Word: ${search}`).setDescription(`${this.client.config.arrow} **Definition**: ${fetched[0].definition}\n${this.client.config.arrow} **Example**: ${fetched[0].example}`).setFooter('Page 1/1')] })        
    }
    } else {
      fetched = await normalDic(this.client.config.Dictionary).define(search).catch(() => { return undefined });
      if (!fetched)
        return message.reply({
          embeds: [this.client.tools.embed().setDescription(`No definitions found for ${search}`).setColor('RED')]
        });
     if (fetched.length > 1) {
         return this.handlePages(message, fetched, search, urban)
     } else {
         return message.reply({ embeds: [this.client.tools.embed().setTitle(`Word: ${search}`).setDescription(`${this.client.config.arrow} **Part Of Speech**: ${fetched.definitions[0].type}\n${this.client.config.arrow} **Definition**: ${fetched.definitions[0].definition}\n${this.client.config.arrow} **Example**: ${fetched.definitions[0].example}`).setFooter('Page 1/1')] })
     }
    }
   }
   async handlePages(message, fetched, search, urban) {
    // Variables
    const isUrban = !!urban;
    const author = message.author.id;
    const msgId = message.id;
    let format;  
    let index = 0;       
    let result = []
    let totalPages = fetched?.definitions ? fetched.definitions.length : fetched.length;
       
    if (isUrban === true) {
        format = (indexNum) => { 
        return `${this.client.config.arrow} **Definition**: ${fetched[indexNum].definition}\n${this.client.config.arrow} **Example**: ${fetched[index].example}`
        }
    } else {
        format = (indexNum) => {
        return `${this.client.config.arrow} **Part Of Speech**: ${fetched.definitions[indexNum].type}\n${this.client.config.arrow} **Definition**: ${fetched.definitions[indexNum].definition}${fetched.definitions[indexNum]?.example ? `\n${this.client.config.arrow} **Example**: ${fetched.definitions[indexNum].example}` : ''}`
        }
    }   

    let msg = await message.reply({ embeds: [this.client.tools.embed().setTitle(`Word: ${search}`).setDescription(await format(index)).setFooter(`Page ${index + 1}/${totalPages}`)], components: [new MessageActionRow().addComponents([new MessageButton().setEmoji('870638670212915291').setCustomId(`back${msgId}`).setStyle('PRIMARY'), new MessageButton().setEmoji('870638701158465566').setCustomId(`next${msgId}`).setStyle('PRIMARY')])] });
        
    let filter = i => i.user.id === author;    
    let collector = message.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 30000 });    
    
    if (!message.commandId) {
        message = msg
        message.editReply = msg.edit;
    }
       
    collector.on('collect', async i => {
    if (i.customId === `next${msgId}`) {
        
        index++;        
        if(index == totalPages) index = 0;        
        collector.resetTimer({ time: 30000 });
     
        await message.editReply({ embeds: [this.client.tools.embed().setTitle(`Word: ${search}`).setDescription(await format(index)).setFooter(`Page ${index + 1}/${totalPages}`)] });
    } else if (i.customId === `back${msgId}`) {
        if(index <= 0) index = totalPages;                
        index--;   
        collector.resetTimer({ time: 30000 });        
        
        await message.editReply({ embeds: [this.client.tools.embed().setTitle(`Word: ${search}`).setDescription(await format(index)).setFooter(`Page ${index + 1}/${totalPages}`)] });        
    }
    });
       
    collector.on('end', collected => message.editReply({ components: [] }))    
   }
};