const { Listener } = require('@sapphire/framework');
const { Util } = require('discord.js');
const moment = require('moment');
const _ = require('lodash');

module.exports = class MessageUpdateListener extends Listener {
    constructor(context) {
        super(context, { 
            event: 'messageUpdate'
        })
    }
    async run(oldMessage, newMessage) {        
        // Check if testMode is turned on
        if (this.container.client.config.testMode) return;
        if (oldMessage.guild.id !== '655109296400367618') return;
        
        newMessage = await newMessage.fetch().catch(() => {});        
        if (!newMessage) return;
        if (newMessage.deleted) return;
        if (newMessage.author.bot) return;
        if (['DM', 'GUILD_VOICE', 'GUILD_CATEGORY', 'GUILD_STAGE_VOICE'].includes(oldMessage.channel.type)) return;
        
        let { member, author, guild, content, client } = newMessage;
        content = await Util.escapeMarkdown(content);
        content = await content.replaceAll('`', '');

        const blacklistedWords = client.blacklistedWords;
        const wildCardWords = client.blacklistedWords.filter(items => items.wild === true)
        let found = [];
        
        for(let i = 0; i < wildCardWords.length; i++) {
            let regex = new RegExp(wildCardWords[i].word, 'gi');
            let matched = await content.match(regex);
            matched = await _.compact(matched);
            if (matched.length) {
                let index;
                if (wildCardWords[i].action === 'ban') index = 1;
                else if (wildCardWords[i].action === 'kick') index = 2;
                else if (wildCardWords[i].action === 'warn') index = 3;
                else if (wildCardWords[i].action === 'delete') index: 4;
                
               found.push({ word: wildCardWords[i].word, action: wildCardWords[i].action, index: index })
            }
        };
        
        if (!found.length) {
            let matched = content.toLowerCase().split(' ');
            matched = await _.compact(matched);
            if (matched.length) {
                for (let i = 0; i < blacklistedWords.length; i++) {
                    if (matched == blacklistedWords[i].word) {
                        let index;
                        let regex = new RegExp(blacklistedWords[i].word, 'gi')
                        if (blacklistedWords[i].action === 'ban') index = 1;
                        else if (blacklistedWords[i].action === 'kick') index = 2;
                        else if (blacklistedWords[i].action === 'warn') index = 3;
                        else if (blacklistedWords[i].action === 'delete') index: 4;
                        
                        newMessage.content = newMessage.content.replaceAll(regex, `**__${blacklistedWords[i].word}__**`);
                        found.push({ word: blacklistedWords[i].word, action: blacklistedWords[i].action, index: index })
                    }
                }
            }
        }
        
        
        if (found.length) {
            if (found.length > 1) {
                found = _.sortBy(found, (i) => { i.index });
                _.reverse(found);               
            }
            found = found[0];
            
            const action = found.action.toLowerCase();
            const word = found.word;
            const reportChnl = await newMessage.guild.channels.cache.get(client.config.staffReportChnl);
            const { embed } = client.tools;
            await newMessage.delete();
            
            const report = async(contnt, userDm) => {
                await reportChnl.send({
                    embeds: [embed().setTitle('Message Moderation').setAuthor(`${oldMessage.author.tag} || [${oldMessage.author.id}]`, oldMessage.author.displayAvatarURL({ dynamic: true })).setColor('RED').setDescription(contnt + `\n${client.config.arrow} **Word**: ${word} \n${client.config.arrow} **Channel**: <#${newMessage.channel.id}>\n${client.config.arrow} **Author's Message**: ||${newMessage.content}||`)]
                });
                if (userDm) {
                    return newMessage.author.send({
                        embeds: [embed().setDescription(userDm).setColor('RED').setAuthor(newMessage.guild.name, newMessage.guild.iconURL({ dynamic: true }))]
                    }).catch(() => {
                        return newMessage.channel.send({
                            content: `<@${newMessage.author.id}>`,
                            embeds: [embed().setDescription(userDm).setColor('RED')]
                        }).catch(() => {})
                    })
                }
            }
            
            if (action === 'delete') {
                return report(`Action: Delete`)
            } else if (action === 'warn') {
                return report(`Action: Warn`, `Please don't use **${word}** in your messages. You've been warned.`)                
            } else if (action === 'kick') {
                await report(`Action: Kick`, `You've been kicked from **${newMessage.guild.name}** for using **${word}** in your message.`);
                return newMessage.member.kick();
            } else if (action === 'ban') {
                await report(`Action: Ban`, `You've been banned from **${newMessage.guild.name}** for using **${word}** in your message. If you'd like to appeal for an unban, please join [this server](https://discord.gg/Xbbp7N87dM)`);
                return newMessage.member.ban()
            }
        }        
    }
}