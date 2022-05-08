const { Listener } = require('@sapphire/framework');
const rss = new (require("rss-parser"))();
const cron = require('node-cron');
const moment = require('moment');
const _ = require('lodash');

module.exports = class ReadyListener extends Listener {
    constructor(context) {
        super(context, {
            once: true,
            event: 'ready',
        });
    }
    async run(client) {        
        console.log('Toasty\'s Online.');
        let slashCommands = client.stores.get('slashCommands');
        if (slashCommands.size > 0) {
            await slashCommands.registerCommands();
            console.log('Slash Commands Loaded.')
        }
        if (!client.serverActivity.size) {
            client.serverActivity.set('messages', {
                today: 0,
                staff: 0
            })
        }
         
        await this.cacheStuff(client);
        await this.checkStaffExists(client);
        console.log('Tags Loaded.')
        cron.schedule('*/60 * * * *', async() => {
            await this.cacheStuff(client);
            await this.checkStaffExists(client);
        });
        
        // Check if testMode is turned on
        if (client.config.testMode) return;
        // Auto Remove Strikes Every Month
         cron.schedule('0 0 0 1 * *', async () => {           
           let doc = await client.tools.models.staff.find();
           doc.forEach(async (document) => {             
             document.strikes = 0;
             await document.save();
           });             
           console.log('[Staff] Strikes Reset.');
         });
         
        if (client.config.staffChecks) {            
            cron.schedule('*/5 * * * *', async() => {                
                await this.syncCheckedInMsg(client);
                await this.syncLeaveNotices(client);
                await this.checkUpload(client)
            });

            cron.schedule(`0 0 6 * * *`, async() => {
                await this.resetCheckIn(client)
            }, {
                timezone: 'Europe/London'
            });
        }
    } 
    async checkUpload(client) {                
        let data = await rss.parseURL('https://www.youtube.com/feeds/videos.xml?channel_id=UC7-pjRSGoNEMoIujwOH2Mhw');
        const logs = await client.tools.models.youtubeVids.findOne();
  
        if (moment().diff(moment(data.items[0].pubDate), 'minutes') > 65) return;
        if (!logs) {
            await new client.tools.models.youtubeVids({
                videos: [data.items[0].link]
            }).save()
        } else {
            if (!logs.videos.includes(data.items[0].link)) {
                logs.videos.push(data.items[0].link)
                await logs.save()
            } else return;            
        }
        data = data.items[0];
        let chnl = await client.channels.fetch('738831830693707837')
        return chnl.send({
            content: `**${data.author}** just uploaded! Go watch @everyone!\n\n${data.link}`,
        })
    }
    async checkStaffExists(client) {
        const { staff } = client.tools.models;
        const docs = await staff.find();
        const guild = await client.guilds.fetch('655109296400367618');
    
        docs.forEach(async (doc) => {
            let member = await guild.members.fetch(doc.user).catch((e) => { return false; });
            if (member) {
                if (!member.roles.cache.has(client.config.staffRole) && !member.roles.cache.has(client.config.mutedRole)) doc.delete();
            } else doc.delete();
        });
    }
    async resetCheckIn(client) {        
        const { models, embed, randomNum } = client.tools;
        const guild = await client.guilds.fetch('655109296400367618');
        const checkInChnl = await guild.channels.fetch('733307358070964226');
        const msg = await checkInChnl.messages.fetch('777522764525338634');
        const archiveChnl = await client.channels.fetch('768164438627844127');
        const archiveContent = [];
        let beStriked = [];
        
        if (client.config.checkinUpdate === true) return;
        client.config.checkinUpdate = true;
        console.log('[Staff] Reset Check-In.');
        const leaveDocs = await models.leave.find();
        const staffDocs = await models.staff.find();
        
        staffDocs.forEach(async (doc) => {
          if (doc.msgInfo?.today < doc.msgInfo?.dailyCount - 1) {
            if (doc.onLeave === false) {
              await beStriked.push(doc.user);
            }
          }
          await archiveContent.push(`<@${doc.user}> - ${doc.msgInfo?.today}/${doc.msgInfo?.dailyCount}`);
        });

        if (beStriked.length) {
          for (let i = 0; i < beStriked.length; i++) {
            const staffDoc = await models.staff.findOne({ user: beStriked[i] });
            if (!staffDoc.strikes) {
              staffDoc.strikes = 1;
              await staffDoc.save();
            } else {
              staffDoc.strikes++;
              await staffDoc.save();
            }
            if (staffDoc && staffDoc.strikes % 3 == 0) {
              if (await guild.members.fetch(beStriked[i])) {
                await guild.channels.cache
                  .get('805154766455701524')
                  .send(`<@${beStriked[i]}> has ${staffDoc.strikes} strikes now.`);
                setTimeout(async () => {
                  await guild.channels.cache.get('805154766455701524').send(`@everyone ^`);
                }, 3000);
              } else {
                beStriked = _.remove(beStriked, function (f) {
                  return f !== beStriked[i];
                });
              }
            }
          };
          
          if (beStriked.length) {
            const striked = [];
            for(let i = 0; i < beStriked.length; i++) {
              const userDoc = await models.staff.findOne({ user: beStriked[i] });
              striked.push(`${client.config.arrow} <@${beStriked[i]}> - ${userDoc?.strikes} strike(s)`)
            }
            await guild.channels.cache.get('709043664667672696').send({
              content: beStriked.map((user) => `<@${user}>`).join(', '),
              embeds: [embed().setDescription(`You have been striked for not being active yesterday.\n${striked.join('\n')}`)]
            });
          }
        }
        
        await archiveChnl.send({
          embeds: [embed().setDescription(`Format: Total Messages Sent Yesterday/Check-In Count For Yesterday\n${archiveContent.join('\n')}`).setFooter(msg.embeds[0].footer ? msg.embeds[0].footer.text.replace('Checked-In Staff |', '') : '')]
        });
        
        const staffRole = await guild.roles.cache.get(client.config.staffRole);
        await msg.edit({
          embeds: [
            embed().setFooter(`Checked-In Staff | Date: ${moment().format('MMM Do YY')}`),
            embed().setDescription(`${staffRole.members.map((m) => `:x: <@${m.user.id}>`).join('\n')}`).setFooter(`Inactive Staff | Last Edited`).setTimestamp()
          ],
        });
        await staffDocs.forEach(async (userDoc) => {
          if (userDoc.msgInfo?.today > userDoc.msgInfo?.randomCount) {
            userDoc.msgInfo.dailyCount = randomNum(11, 30) / 2;
          } else {
            userDoc.msgInfo.dailyCount = randomNum(11, 30);
          }
            
          if(!userDoc.msgInfo.dailyMsgs.length) {
              userDoc.msgInfo.dailyMsgs = [userDoc.msgInfo.today]
          } else {
              if (userDoc.msgInfo.dailyMsgs >= 7) userDoc.msgInfo.dailyMsgs = [];
              userDoc.msgInfo.dailyMsgs.push(userDoc.msgInfo.today)
          }
          userDoc.msgInfo.randomCount = randomNum(11, 30) + 150;
          userDoc.msgInfo.today = 0;
          await userDoc.save();
        });
        
        if (client.botPrefixes.length) {
            let counts = {};
            let prefixDoc = await models.ignore.findOne();
            client.botPrefixes.sort().forEach(async(item, index, array) => {                
                if ((index > 0) && (array[index - 1] == item)) {                    
                    counts[item] = (counts[item] + 1) || 1;
                    if (counts[item] >= 5) {
                        if (!prefixDoc) {
                            await models.ignore({
                                phrases: [item]
                            }).save();
                        } else if (prefixDoc && !prefixDoc?.phrases.has(item)){
                            prefixDoc.phrases.push(item);
                        }
                    }
                }
            });
            await prefixDoc.save();                        
            client.botPrefixes = [];
            counts = {};
        }
        let activityDoc = await models.serverActivity.findOne();
        if (!activityDoc) {
            await new models.serverActivity({
                messages: [{
                    count: (client.serverActivity.get('messages')?.today ?? 0),
                    staff: (client.serverActivity.get('messages')?.staff ?? 0),
                    total: ((client.serverActivity.get('messages')?.today ?? 0) + (client.serverActivity.get('messages')?.staff ?? 0)),
                    date: moment(moment().subtract(1, 'days')).format('DD/MM/YYYY')
                }]
            }).save()
        } else {
            if (activityDoc.messages.length > 7) {
                activityDoc.messages = [];
            }
            activityDoc.messages.push({
                count: (client.serverActivity.get('messages')?.today ?? 0),
                total: ((client.serverActivity.get('messages')?.today ?? 0) + (client.serverActivity.get('messages')?.staff ?? 0)),
                staff: (client.serverActivity.get('messages')?.staff ?? 0),
                date: moment(moment().subtract(1, 'days')).format('DD/MM/YYYY')
            })
            await activityDoc.save()
        }
        client.serverActivity.get('messages').staff = 0; 
        client.serverActivity.get('messages').today = 0;
        client.config.checkinUpdate = false;
    }
    async syncCheckedInMsg(client) {
        const { models, embed } = client.tools;
        const { leave, staff } = models;
        const guild = await client.guilds.fetch('655109296400367618');
        const clockInChnl = await guild.channels.fetch('733307358070964226');
        const staffDocs = await staff.find();
        const msg = await clockInChnl.messages.fetch('777522764525338634');   
        const checkedInUsers = [];
        const notCheckedInUsers = [];
       
        for (let i = 0; staffDocs.length > i; i++) {
          if (staffDocs[i]?.msgInfo?.dailyCount <= staffDocs[i]?.msgInfo?.today) {
            checkedInUsers.push({ user: staffDocs[i]?.user, count: staffDocs[i]?.msgInfo?.today });
          } else {
            notCheckedInUsers.push({ user: staffDocs[i]?.user, count: staffDocs[i]?.msgInfo?.today, dailyCount: staffDocs[i]?.msgInfo?.dailyCount });
          }
        }
        
        return msg.edit({
          embeds: [
            embed().setColor('GREEN').setFooter(msg.embeds[0].footer.text ?? 'No Text?').setDescription(checkedInUsers.map((item) => `${client.config.tick} <@${item.user}> - ${item.count} messages today`).join('\n')),
            embed().setColor('RED').setFooter(`Inactive Staff | Last Edited`).setTimestamp().setDescription(notCheckedInUsers.map((item) => `${client.config.cross} <@${item.user}> - ${item.count}/${item.dailyCount} messages today`).join('\n'))
          ],
        });
    }
    async syncLeaveNotices(client) {
        const { models, embed } = client.tools;
        const { leave, staff } = models;
        const guild = await client.guilds.fetch('655109296400367618');
        const noticeChnl = await guild.channels.fetch('757169784747065364');
        let leaveDoc = await leave.find();

        for (let i = 0; i < leaveDoc.length; i++) {
          let staffDoc = await staff.findOne({ user: leaveDoc[i].user });
            if (staffDoc) {          
              if (moment().isAfter(moment(new Date(leaveDoc[i].end)))) {             
                await noticeChnl.send({
                  content: `<@${leaveDoc[i].user}>,`,
                  embeds: [embed().setDescription(`Hey! Your leave notice from <t:${moment(new Date(leaveDoc[i].start)).unix()}:R> just ended! Hope you had great time on your time off!!\n\n***__${leaveDoc[i].reason}__***`)]
                });  
                if (await (leaveDoc.filter(docs => docs._id !== leaveDoc[i]._id && docs.user == leaveDoc[i].user).size < 0)) {                
                  staffDoc.onLeave = false;
                  await staffDoc.save();
                } 
                await leaveDoc[i].delete();
              }
              
              if (moment().isBefore(moment(new Date(leaveDoc[i].start))) && staffDoc.onLeave === true) {
                staffDoc.onLeave = false;
                await staffDoc.save()
              } else if (moment().isSameOrAfter(moment(new Date(leaveDoc[i].start))) && staffDoc.onLeave === false) {
                staffDoc.onLeave = true;
                await staffDoc.save()
              }
            } else {
              await leaveDoc[i].delete()
            }
        };
      return;
    }
    async cacheStuff(client) {
        const tagDocs = await client.tools.models.tag.find();
        await tagDocs.forEach((doc) => {
            if (!client.tags.has(doc.name)) {
                client.tags.set(doc.name, { content: doc.content, files: doc.files })
            }
        });
        
        await client.tools.wait(10000);
        const blacklistedWordDocs = await client.tools.models.blacklist.find();
        await blacklistedWordDocs.forEach((doc) => {
            if (!client.blacklistedWords.find(item => item.word === doc.word)) {
                client.blacklistedWords.push({ word: doc.word, action: doc.action, wild: doc.wild })
            }
        });
        const ignoredWords = await client.tools.models.ignore.findOne();
        if (ignoredWords) client.ignorePhrases = ignoredWords.phrases;
        return;
    }   
}
