const _ = require('lodash');
const day = require('dayjs');
const moment = require('moment');
const cron = require('node-cron');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const { exec } = require('child_process');
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

    // Auto Update System
    cron.schedule('*/15 * * * *', async () => {
      exec(`git pull ${this.client.config.Github}`, async (error, stdout) => {
        let response = error || stdout;
        if (!error) {
          if (response.includes('Already up to date.')) {
          } else {
            exec('npm i', console.log);
            console.log(black.bgGreen('[Github]') + greenBright(' Bot Updated.'));
          }
        }
      });
    });

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
        console.log(black.bgGreen('[Staff]') + greenBright(' Reset Strikes.'));
      });
    });

    if (guild) {
      // Check For Staff Leave and Channel Mutes and Auto Unban
      cron.schedule(`* * * * *`, async () => {
        let unbans = await models.unban.find();
        let docs = await models.chnlmute.find();
        let sal = await this.client.guilds.fetch('655109296400367618');
        let lev = await models.leave.find();

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

        // If Someone's Been Muted In A Channel, It Checks If Their Time Is Up And Unmutes Them.
        if (docs.length) {
          docs.forEach(async (d) => {
            let time = d.time;
            let date = d.date;
            let hasError = false;
            if (time - (Date.now() - date) < 0) {
              // Using A Try Catch Here To Prevent The Bot From Going Into a Loop If The Victim Left The Server
              try {
                await sal.channels.cache.get(d.chnl).permissionOverwrites.get(d.user).delete();
              } catch (e) {
                await models.chnlmute.findOneAndDelete({
                  user: d.user,
                  chnl: d.chnl,
                });
                hasError = true;
              }
              if (hasError === false) {
                await sal.channels.cache.get(this.client.config.StaffReportChnl).send({
                  embeds: [
                    this.client.tools
                      .embed()
                      .setTitle('Auto Unmute')
                      .setAuthor(`Mod: ${d.mod}`)
                      .addField('**Victim**:', `<@${d.user}> || ${d.user}`, true)
                      .addField('**Reason**:', d.reason, true)
                      .addField('**Channel**:', `<#${d.chnl}>`),
                  ],
                });
                await models.chnlmute.findOneAndDelete({
                  user: d.user,
                  chnl: d.chnl,
                });
              }
            }
          });
        }
      });

      // Daily Staff Reset At 6 AM
      cron.schedule(`0 0 6 * * *`, async () => {
        let sal = this.client.guilds.cache.get('655109296400367618');
        let channel = await this.client.channels.cache.get('733307358070964226');
        let msg = await channel.messages.fetch('777522764525338634');
        let clockin = await this.client.channels.cache.get('768164438627844127');
        let anmsg = await channel.messages.fetch('804073813163376650');
        let mcount = [];

        console.log(black.bgGreen('[Staff]') + greenBright(' Check-In Reset.'));
        let lev = await models.leave.find();
        let doc = await models.staff.find();
        let no = [];
        // Check Every Staff's Document
        doc.forEach(async (d) => {
          // If The Staff Didn't Meet Their Daily Message Count And Is Not On Leave, Add Them To The 'Has To Strike' Array
          if (d.msgs < d.dailyCount - 1) {
            if (d.onLeave === false) {
              await no.push(d.user);
            }
          }
          // Save The Message Count To An Array And Reset Their Message Count
          await mcount.push(`Messages: ${d.msgs} - <@${d.user}>`);
          d.msgs = 0;
          d.save();
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
              if (sal.members.cache.get(n)) {
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
          embeds: [
            this.client.tools
              .embed()
              .setDescription(`Staff who are active today`)
              .setFooter(`Date: ${moment().format('MMM Do YY')}`),
          ],
        });
        let staffRole = await sal.roles.cache.get(this.client.config.StaffRole);
        let staffMessageCount = await models.staff.find();
        await staffMessageCount.forEach(async (countDoc) => {
          countDoc.dailyCount = rannum();
          await countDoc.save();
        });

        anmsg.edit({
          embeds: [
            this.client.tools
              .embed()
              .setDescription(
                `Staff who aren't active today\n${staffRole.members.map((m) => `:x: ${m.user.tag}`).join('\n')}`,
              ),
          ],
        });
      });
    }
  }
};
