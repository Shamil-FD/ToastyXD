const _ = require('lodash');
const fetch = require('node-fetch');
const normalDic = require('owlbot-js');
const urbanDic = require('urban-dictionary');
const Command = require('../../structure/SlashCommand');
const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = class DictionaryCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'dictionary',
        description: 'Get a definition of a word.',
        category: 'Information',
        options: [
            {
                name: 'normal', description: 'Search the Merriam-Webster dictionary',
                type: 'SUB_COMMAND', options: [{                    
                    name: 'word',
                    description: 'The word that you want the definition of.',
                    required: true,
                    type: 'STRING',                    
                }]
            },             
            {                
                name: 'urban', description: 'Search the urban dictionary',
                type: 'SUB_COMMAND', options: [{                    
                    name: 'word',
                    description: 'The word that you want the definition of.',
                    required: true,
                    type: 'STRING',
                  }]
            }]           
      });
    }    
    async run(message, options) {
        const subCmd = await options.getSubcommand(true);
        await message.deferReply()
        if (subCmd.toLowerCase() === 'normal') {
            return this.runNormal(message, options)
        } else {
            return this.runUrban(message, options)
        }
    }
    async runNormal(message, options) {        
        const search = options.get('word').value;
        const { embed } = message.client.tools;
        const { arrow } = message.client.config;
        const fetched = await normalDic(message.client.config.dictionary).define(search) || undefined;
      
        if (!fetched) return message.editReply({
            embeds: [message.client.tools.embed().setDescription(`No definitions found for ${search}`).setColor('RED')]
        });
        if (fetched?.definitions.length === 1) {
            return message.editReply({                
                embeds: [embed().setTitle(`${arrow} ${search}`).setDescription(`${arrow} **Pronunciation**: ${fetched.definitions[0].pronunciation}\n${arrow} **Type**: ${fetched.definitions[0].type}\n${arrow} **Definition**: ${fetched.definitions[0].definition}${fetched.definitions[0]?.example ? `\n${arrow} **Example**: ${fetched.definitions[0].example}` : ''}`)]
            });
        }
     
        return this.handlePages(message, fetched.definitions, search, false, fetched.pronunciation)
    }
    async runUrban(message, options) {
        const search = options.get('word').value;
        let fetched = await urbanDic.define(search);
        const { embed } = message.client.tools;
        const { arrow } = message.client.config;
        
        if (!fetched.length) return message.editReply({
            embeds: [embed().setDescription(`I couldn't find any definitions for ${search}`)]
        })
        if (fetched.length === 1) {            
            return message.editReply({                
                embeds: [embed().setTitle(`${arrow} ${search}`).setURL(fetched[0].permalink).setDescription(`${arrow} **Definition**: ${fetched[0].definition}\n${arrow} **Example**: ${fetched[0].example}`)]
            });
        }
        fetched = await _.sortBy(fetched, (i) => { return i.thumbs_up });
        return this.handlePages(message, fetched, search, true)
    }
    async handlePages(message, array, word, isUrban, pronunciation) {
        let index = 0;
        const totalPages = array.length;
        const { arrow } = message.client.config;
        const { embed } = message.client.tools;       
        const buttonArray = [new MessageButton().setEmoji('870638670212915291').setCustomId(`back${message.id}`).setStyle('PRIMARY'), new MessageButton().setEmoji('870638701158465566').setCustomId(`next${message.id}`).setStyle('PRIMARY')];
        
        const filter = i => i.user.id === message.user.id;    
        const collector = await message.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 30000 });    
        if (isUrban) {
            await message.editReply({                
                embeds: [embed().setTitle(`${arrow} ${word}`).setURL(array[0].permalink).setDescription(`${arrow} **Definition**: ${array[0].definition}\n${arrow} **Example**: ${array[0].example}`).setFooter(`Page 1/${totalPages}`)],
                components: [new MessageActionRow().addComponents(buttonArray)]
            });
        } else {
            await message.editReply({                
                embeds: [embed().setTitle(`${arrow} ${word}`).setDescription(`${arrow} **Pronunciation**: ${pronunciation}\n${arrow} **Type**: ${array[0]?.type}\n${arrow} **Definition**: ${array[0]?.definition}${array[0]?.example ? `\n${arrow} **Example**: ${array[0].example}` : ''}`).setFooter(`Page 1/${totalPages}`)],
                components: [new MessageActionRow().addComponents(buttonArray)]
            });
        }
        
        collector.on('collect', async i => {
            if (i.customId === `next${message.id}`) {
                index++;
                if (index >= totalPages) index = 0;
                await collector.resetTimer({ time: 30000 });
                
                if (!isUrban) {
                    await i.update({
                        embeds: [embed().setTitle(`${arrow} ${word}`).setDescription(`${arrow} **Pronunciation**: ${pronunciation}\n${arrow} **Type**: ${array[index].type}\n${arrow} **Definition**: ${array[index].definition}${array[index]?.example ? `\n${arrow} **Example**: ${array[index].example}` : ''}`).setFooter(`Page ${(index + 1)}/${totalPages}`)],
                        components: [new MessageActionRow().addComponents(buttonArray)]                        
                    });
                } else {
                    await i.update({
                        embeds: [embed().setTitle(`${arrow} ${word}`).setURL(array[index].permalink).setDescription(`${arrow} **Definition**: ${array[index].definition}\n${arrow} **Example**: ${array[index].example}`).setFooter(`Page ${(index + 1)}/${totalPages}`)],
                        components: [new MessageActionRow().addComponents(buttonArray)]                        
                    });
                }
                } else if (i.customId === `back${message.id}`) {                    
                    index--;                    
                    if (index <= 0) index = (totalPages - 1);                    
                    await collector.resetTimer({ time: 30000 });
                
                    if (!isUrban) {                        
                        await i.update({                            
                            embeds: [embed().setTitle(`${arrow} ${word}`).setDescription(`${arrow} **Pronunciation**: ${pronunciation}\n${arrow} **Type**: ${array[index].type}\n${arrow} **Definition**: ${array[index].definition}${array[index]?.example ? `\n${arrow} **Example**: ${array[index].example}` : ''}`).setFooter(`Page ${(index + 1)}/${totalPages}`)],
                            components: [new MessageActionRow().addComponents(buttonArray)]                            
                        });
                    } else {
                        await i.update({                            
                            embeds: [embed().setTitle(`${arrow} ${word}`).setURL(array[index].permalink).setDescription(`${arrow} **Definition**: ${array[index].definition}\n${arrow} **Example**: ${array[index].example}`).setFooter(`Page ${(index + 1)}/${totalPages}`)],
                            components: [new MessageActionRow().addComponents(buttonArray)]                            
                    });
                }   
            }            
        })
        collector.on('end', async() => {
            buttonArray[0].setDisabled(true);
            buttonArray[1].setDisabled(true);
            await message.fetchReply()
            return message.editReply({
                components: [new MessageActionRow().addComponents(buttonArray)]
            })
        })
    }    
};