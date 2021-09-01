const _ = require('lodash');
const day = require('dayjs');
const moment = require('moment');
const cron = require('node-cron');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const { Formatters } = require('discord.js');
const { Listener } = require('discord-akairo');
const { black, greenBright } = require('chalk');

module.exports = class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready',
    });
  }

  async exec() {
    let { models, rannum } = this.client.tools;

    console.log(black.bgGreen('[Bot]') + greenBright(" I'm online!"));
    let guild = await this.client.guilds.cache.get('655109296400367618');

    // Connect to Database
    mongoose
      .connect(this.client.config.Mongo, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
      })
      .then(console.log(black.bgGreen('[MongoDB]') + greenBright(' DataBase Connected.')));

    // Check if testMode is turned on
    if (this.client.config.testMode === true) return;

    // Check For Useless Documents
    cron.schedule('*/59 * * * *', async () => {
      guild = await this.client.guilds.cache.get('655109296400367618');
      let docs = await models.staff.find();
      docs.forEach(async (doc) => {
        let member = await guild.members.fetch(doc.user);
        if (!member || !member.roles.cache.has(this.client.config.StaffRole)) {
          await doc.delete();
        }
      });
    });

    // Auto Remove Strikes Every Month
    cron.schedule('0 0 0 1 * *', async () => {
      let doc = await models.staff.find();
      doc.forEach(async (document) => {
        document.strikes = 0;
        await document.save();
      });
        console.log(black.bgGreen('[Staff]') + greenBright(' Reset Strikes.'));
    });

    if (guild) {
      // Check For Staff Leave and Channel Mutes and Auto Purge Verify Channel
      cron.schedule(`* * * * *`, async () => {
        let sal = await this.client.guilds.fetch('655109296400367618');
        let lev = await models.leave.find();

        let verifychannel = await sal.channels.fetch('801877313855160340');
        if (verifychannel) {
          let msg = await verifychannel.messages.fetch().then((m) => m.first());
          if (!msg.pinned) {
            if (msg.createdAt < Date.now() - 600000) {
              let msgs = await verifychannel.messages.fetch();
              if (msgs.size > 0) {
                msgs = msgs.filter((m) => m.pinned === false);
                await verifychannel.bulkDelete(msgs).catch((e) => {
                  console.log(e);
                });
              }
            }
          }
        }
        // If There Is Someone On Leave, It Checks If Their Leave Is Over
        if (lev.length) {
          lev.forEach(async (l) => {
            if (day().isAfter(day(l.end))) {
              await sal.channels.cache.get('757169784747065364').send({
                content: `<@${l.user}>,`,
                embeds: [
                  this.client.tools
                    .embed()
                    .setDescription(`Welcome back from your leave. Hope you had a great time during the leave! <3`)
                    .setAuthor('Welcome back!!')
                    .setThumbnail('https://cf.ltkcdn.net/kids/images/std/198106-425x283-Very-Excited-Toddler.jpg')
                    .addField('Reason:', l.reason)
                    .addField('Started On:', l.start, true)
                    .addField('Ended On:', l.end, true),
                ],
              });
              await models.leave.findOneAndDelete({ user: l.user });
              let UpdateLeave = await models.staff.findOne({ user: l.user });
              if (UpdateLeave) {
                UpdateLeave.onLeave = false;
                await UpdateLeave.save();
              }
            }
          });
        }
      });

      cron.schedule('*/10 * * * *', async () => {
        // Tags Cache Refresh
        let tags = await models.tag.find();
          if (tags.length) {
              tags.forEach((tag) => {
                  if (!this.client.tags.has(tag.name)) {
                      this.client.tags.set(tag.name, { name: tag.name })
                  }
              })
          }
          
        // Check-In Message Update         
        guild = await guild.fetch();
        let clockInChnl = await guild.channels.cache.get('733307358070964226');
        let staffDocs = await models.staff.find();
        let notCheckedInMsg = await clockInChnl.messages.fetch('804073813163376650');
        let checkedInMsg = await clockInChnl.messages.fetch('777522764525338634');

        let checkedInUsers = [];
        let notCheckedInUsers = [];
        for (let i = 0; staffDocs.length > i; i++) {
          if (staffDocs[i]?.msgInfo?.dailyCount <= staffDocs[i]?.msgInfo?.today) {
            checkedInUsers.push({ user: staffDocs[i]?.user, count: staffDocs[i]?.msgInfo?.today });
          } else {
            notCheckedInUsers.push({ user: staffDocs[i]?.user, count: staffDocs[i]?.msgInfo?.today, dailyCount: staffDocs[i]?.msgInfo?.dailyCount });
          }
        }
        await checkedInMsg.edit({
          embeds: [
            this.client.tools
              .embed()
              .setColor('GREEN')
              .setFooter(checkedInMsg.embeds[0].footer.text ?? 'No Text?')
              .setDescription(
                checkedInUsers
                  .map((item) => `${this.client.config.tick} <@${item.user}> - ${item.count} messages today`)
                  .join('\n'),
              ),
          ],
        });
        await notCheckedInMsg.edit({
          embeds: [
            this.client.tools
              .embed()
              .setColor('RED')
              .setFooter(`Inactive Staff | Last Edited`)
              .setTimestamp()
              .setDescription(
                notCheckedInUsers
                  .map((item) => `${this.client.config.cross} <@${item.user}> - ${item.count}/${item.dailyCount} messages today`)
                  .join('\n'),
              ),
          ],
        });
      });

      // Daily Staff Reset At 6 AM
      cron.schedule(`0 0 6 * * *`, async () => {
        let sal = this.client.guilds.cache.get('655109296400367618');
        let channel = await this.client.channels.cache.get('733307358070964226');
        let msg = await channel.messages.fetch('777522764525338634');
        let clockin = await this.client.channels.cache.get('768164438627844127');
        let anmsg = await channel.messages.fetch('804073813163376650');
        let mcount = [];

        this.client.config.CheckinUpdate = true;
        console.log(black.bgGreen('[Staff]') + greenBright(' Check-In Reset.'));
        let lev = await models.leave.find();
        let doc = await models.staff.find();
        let no = [];
        // Check Every Staff's Document
        doc.forEach(async (d) => {
          // If The Staff Didn't Meet Their Daily Message Count And Is Not On Leave, Add Them To The 'Has To Strike' Array
          if (d.msgInfo?.today < d.msgInfo?.dailyCount - 1) {
            if (d.onLeave === false) {
              await no.push(d.user);
            }
          }
          await mcount.push(
            `<@${d.user}> - Messages Yesterday: ${d.msgInfo?.today} - Checkin Count for Yesterday: ${d.msgInfo?.dailyCount} `,
          );
        });

        // Check If Anyone Need To Be Striked, If Yes, Strike Them And Notify Them
        if (no.length) {
          no.forEach(async (n) => {
            let StrikeDoc = await models.staff.findOne({ user: n });
            if (!StrikeDoc.strikes) {
              StrikeDoc.strikes = 1;
              await StrikeDoc.save();
            } else {
              StrikeDoc.strikes++;
              await StrikeDoc.save();
            }
            if (StrikeDoc && StrikeDoc.strikes % 3 == 0) {
              if (await sal.members.fetch(n)) {
                await sal.channels.cache
                  .get('805154766455701524')
                  .send(`<@${n}> has ${StrikeDoc.strikes} strikes now.`);
                setTimeout(async () => {
                  await sal.channels.cache.get('805154766455701524').send(`@everyone ^`);
                }, 3000);
              } else {
                no = _.remove(no, function (f) {
                  return f !== n;
                });
              }
            }
          });
          if (no.length) {
            await sal.channels.cache.get('709043664667672696').send({
              content: no.map((n) => `<@${n}>`).join(', '),
              embeds: [
                this.client.tools
                  .embed()
                  .setDescription(
                    "You've been striked for not being active today. Check your strike count in t)staffinfo.",
                  ),
              ],
            });
          }
        }
        await clockin.send({
          embeds: [
            this.client.tools
              .embed()
              .setDescription(msg.embeds[0].description + `\n\n${mcount.join('\n')}`)
              .setFooter(msg.embeds[0].footer ? msg.embeds[0].footer.text : ''),
          ],
        });
        msg.edit({
          embeds: [this.client.tools.embed().setFooter(`Checked-In Staff | Date: ${moment().format('MMM Do YY')}`)],
        });
        let staffRole = await sal.roles.cache.get(this.client.config.StaffRole);
        let staffMessageCount = await models.staff.find();
        await staffMessageCount.forEach(async (countDoc) => {
          if (countDoc.msgInfo?.today > countDoc.msgInfo?.randomCount) {
            countDoc.msgInfo.dailyCount = rannum() / 2;
          } else {
            countDoc.msgInfo.dailyCount = rannum();
          }
          countDoc.msgInfo.randomCount = rannum() + 150;
          countDoc.msgInfo.today = 0;
          await countDoc.save();
        });

        anmsg.edit({
          embeds: [
            this.client.tools
              .embed()
              .setDescription(`${staffRole.members.map((m) => `:x: <@${m.user.id}>`).join('\n')}`)
              .setFooter(`Inactive Staff | Last Edited`)
              .setTimestamp(),
          ],
        });
        this.client.config.CheckinUpdate = false;
      });
    }
  }
};
