const { Listener } = require('@sapphire/framework');
const { Util } = require('discord.js');
const moment = require('moment');
const _ = require('lodash');

module.exports = class MessageCreateListener extends Listener {
    constructor(context) {
        super(context, { 
            event: 'messageCreate'
        })
    }
    async run(message) {
        if (['DM', 'GUILD_VOICE', 'GUILD_CATEGORY', 'GUILD_STAGE_VOICE'].includes(message.channel.type)) return;
        if (message.author.bot) return;                
         // Check if testMode is turned on
        if (this.container.client.config.testMode) return;
        await this.serverActivity(message);
        if(await this.checkBlacklist(message)) return;
        await this.checkBotPrefixes(message);
        await this.checkTags(message);
        await this.checkFirstMessageInHelp(message);
        await this.helpMe(message);
        await this.checkStaff(message);
        return this.checkAfk(message);
    }
    async serverActivity(message) {
        if (message.member.roles.cache.has('752632482943205546')) {
            if (!message.client.serverActivity.get('messages')) {                
                return message.client.serverActivity.set('messages', {
                    staff: 1
                })
            } else {
                return message.client.serverActivity.get('messages').staff++;
            }
        };        
        if (!message.client.serverActivity.get('messages')) {
            return message.client.serverActivity.set('messages', {
                today: 1
            })
        } else {
            return message.client.serverActivity.get('messages').today++;
        }
    }
    async checkBotPrefixes(message) {        
        if (message.channel.id !== '850627411698647050') return;
        let content = message.content.split(' ')   
        if (content[1]) {
            content = `${content[0]} ${content[1]}`;
        } else {
            content = content[0];
        }
        return message.client.botPrefixes.push(content.toLowerCase())
    }
    async checkStaff(message) {
        const { models, randomNum } = message.client.tools;
        if (!message.member.roles.cache.has('752632482943205546')) return;
        if (message?.content.toLowerCase().startsWith(message.client.config.prefix)) return;
        if (message.channel.id === '850627411698647050') {            
            let content = message?.content.split(' ');
            if (content.length) {
                if (content[1]) {
                    content = `${content[0]} ${content[1]}`;
                    if (message.client.ignorePhrases.length && message.client.ignorePhrases.find(i => i === content.toLowerCase())) return;
                } else {
                    if (message.client.ignorePhrases.length && message.client.ignorePhrases.find(i => i === content[0].toLowerCase())) return;                
                }
            }
        }
        let doc = await models.staff.findOne({ user: message.author.id });

        if (!doc) {            
            return new models.staff({                
                user: message.author.id,
                onLeave: false,
                strikes: 0,
                msgInfo: {
                  today: 1,
                  total: 1,
                  dailyCount: randomNum(30, 11),
                  randomCount: randomNum(30, 11) + 150,
                },
            }).save();            
        } else {                  
          
          if (message.content.length >= 64) {
            
            let cases = {                        
              10: 60, 
              90: 10, 
              100: 70, 
            };

            let randomInt = () => {                        
                let random = Math.floor(Math.random() * 100);
                for (let prob in cases) {                        
                    if (prob >= random) {                                
                        return cases[prob];
                    }
                }
            };

            let randomNumber = randomInt();
            randomNumber > 10 ? (doc.msgInfo.today = doc.msgInfo.today + 2) : doc.msgInfo.today++;
          } else {                    
            doc.msgInfo.today++;
          }
        }
          doc.msgInfo?.total ? doc.msgInfo.total++ : (doc.msgInfo.total = 1);
          return doc.save();        
    }        
    async checkAfk(message) {        
        let afksdoc = await message.client.tools.models.afk.findOne({ user: message.author.id });

        if (afksdoc) {            
            let a = moment(afksdoc.date);
            let b = moment().format();
            let pingbed = message.client.tools.embed().setDescription(
                `${message.author}, glad to see you back!\n${
                  afksdoc.count > 0 ? `You were pinged ${afksdoc.count} times.` : ''
                } You were AFK for ${a.from(b, true)}`,
            );
            
            if (afksdoc.count > 0) pingbed.addField('Jump to Message(s) That Pinged You', afksdoc.pings.join('\n'));
            
            await afksdoc.delete();
            return message.channel.send({ embeds: [pingbed] });      

       
            if (message.mentions.members.first()) {                
                let afkdoc = await message.client.tools.models.afk.findOne({ 
                    user: message.mentions.members.first().id,
                });
                
                if (afkdoc) {                    
                    afkdoc.count++;
                    afkdoc.pings.push(`From ${message.author.tag} - [Jump](` + message.url + ')');
                    await afkdoc.save();
                    
                    let a = moment(afkdoc.date);
                    let b = moment().format();
                    return message.channel.send({                        
                        embeds: [message.client.tools.embed().setDescription(`${message.mentions.members.first()} has been AFK for ${a.from(b, true)}\nReason: ${afkdoc.reason}`).setFooter('PINGS!')]
                    });
                }
            }
        }
    } 
    async helpMe(message) {                
        const helparr = [
        'why cant i type in the help channel',
        'my code doesnt work',
        'my code does not work',
        'i cant send message',
        'video didnt work',
        'code doesnt work',
        'code dont work',
        "i can't type in help",
        'help channel locked',
        'i cant type in help',
        'how to get access to help',
        'how to get help',
        "can't speak in help",
        'can someone help me',
        'i need help',
        'so i need help',
        'how do i get help',
      ];
        
        if (!message.member.roles.cache.get('751032945648730142')) {            
            let dontaskagain = false;
            helparr.map((r) => {                
                if (dontaskagain === false) {                    
                    if (message.content.toLowerCase().includes(r.toLowerCase())) {                        
                        message.reply({                            
                            embeds: [{ description: "Uh oh, someone wants help..\n\nIf you do want help; you need to get to Level 1 on Arcane bot.\n> How do I get to Level 1?\n It's easy, just chat with people.\n> Can I spam?\n No, if you do, you are most likely not to get help.\n> I don't like this..\n Oh you don't? We don't care." }]
                        });                        
                        dontaskagain = true;
                    }
                }
            });
        }
    }
    async checkFirstMessageInHelp(message) {
        if (message.channel.id === '709043365727043588' || message.channel.id === '709043414053814303') {            
            let userProfileDoc = await message.client.tools.models.userProfile.findOne({                
                user: message.member.id,
            });
            
            if (userProfileDoc?.firstTime === true) {                
                userProfileDoc.firstTime = false;
                await userProfileDoc.save()
                await message.reply(
                  `<@${message.author.id}>, Welcome to the help channel. Please make sure to follow these basic rules when asking for help:\n\n1. Do not ask/beg for source code. We don't give out source codes.\n\n2. Don't ping anyone for help.\n\n3. Do not ask for help in DMs.\n\n4. When posting code/errors post them in a source code bin. Links can be found by running the command \`s!bins\`\n\n5. Be patient, people have a life outside of the internet.\n\n6. Don't ask to get help, if you have a question, post your question with code and errors.\n\n7. Make a thread. That is how you get help, you make a thread in this channel. It's really easy, like, just make a thread.\n\n8. We will not help with issues with snipe command for privacy reasons.\n\n9. **Please DO NOT ask any help if you don't have basic knowledge / not willing to learn the language. Might it be any language.**`,
                );
            }
        }
    }
    async checkTags(message) {        
        if (message.content.toLowerCase().startsWith(message.client.config.prefix) || message.content.toLowerCase().startsWith('s!')) {            
            let cmd = message.content.split(/ +/).shift().slice(2).toLowerCase();
            let tag = await message.client.tools.models.tag.findOne({ name: cmd });
            if (tag) {            
                return message.channel.send({ 
                    embeds: [message.client.tools.embed().setDescription(tag.content)], 
                    files: tag?.files.length > 0 ? tag.files : null
                })
            }
            return;
        }
    }
    async checkBlacklist(message) {        
        if (message.guild.id !== '655109296400367618') return;        
        if (message.deleted) return;
        
        let { member, author, guild, content, client } = message;
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
                        
                        message.content = message.content.replaceAll(regex, `**__${blacklistedWords[i].word}__**`);
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
            const reportChnl = await message.guild.channels.cache.get(client.config.staffReportChnl);
            const { embed } = client.tools;
            await message.delete();
            
            const report = async(contnt, userDm) => {
                await reportChnl.send({
                    embeds: [embed().setTitle('Message Moderation').setAuthor(`${message.author.tag} || [${message.author.id}]`, message.author.displayAvatarURL({ dynamic: true })).setColor('RED').setDescription(contnt + `\n${client.config.arrow} **Word**: ${word} \n${client.config.arrow} **Channel**: <#${message.channel.id}>\n${client.config.arrow} **Author's Message**: ||${message.content}||`)]
                });
                if (userDm) {
                    return message.author.send({
                        embeds: [embed().setDescription(userDm).setColor('RED').setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))]
                    }).catch(() => {
                        return message.channel.send({
                            content: `<@${message.author.id}>`,
                            embeds: [embed().setDescription(userDm).setColor('RED')]
                        }).catch(() => {})
                    })
                }
            }
            
            if (action === 'delete') {
                await report(`Action: Delete`)
                return true;
            } else if (action === 'warn') {
                await report(`Action: Warn`, `Please don't use **${word}** in your messages. You've been warned.`)                
                return true;
            } else if (action === 'kick') {
                await report(`Action: Kick`, `You've been kicked from **${message.guild.name}** for using **${word}** in your message.`);
                await message.member.kick();
                return true;
            } else if (action === 'ban') {
                await report(`Action: Ban`, `You've been banned from **${message.guild.name}** for using **${word}** in your message. If you'd like to appeal for an unban, please join [this server](https://discord.gg/Xbbp7N87dM)`);
                await message.member.ban()
                return true;
            }
        }        
        return false;
    }
}
