const { Listener } = require('discord-akairo');

module.exports = class StaffMessageListener extends Listener {
  constructor() {
    super('StaffMessage', {
      emitter: 'client',
      event: 'messageCreate',
    });
  }

  async exec(message) {
    // Check if testMode is turned on
    if (this.client.config.testMode === true) return;

    if (message.author.bot === true) return;
    let { models, rannum } = this.client.tools;
    // Check If Channel Is A Guild Channel
    if (!['DM', 'GUILD_VOICE', 'GUILD_CATEGORY', 'GUILD_STAGE_VOICE'].includes(message.channel.type)) {
      // Staff Check-In Stuff
      if (message.member.roles.cache.has('752632482943205546') === true) {
        if (message.content.toLowerCase().startsWith(this.client.config.prefix)) return;
        let doc = await models.staff.findOne({ user: message.author.id });

        if (!doc) {
          await new models.staff({
            user: message.author.id,
            onLeave: false,
            strikes: 0,
            msgInfo: {
              today: 0,
              total: 0,
              dailyCount: rannum(),
              randomCount: rannum() + 175,
            },
          }).save();
        } else {
          if (!['709043831995105360', '781221115271970826', '853552430515093534'].includes(message.channel.id)) {
            if (message.content.length >= 64) {
              let cases = {
                10: 60, // 0-10 : 60  => 10%
                90: 10, // 10-90 : 10  => 80%
                100: 70, // 90-100 : 70 => 10%
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
          await doc.save();
        }
      }
    }
  }
};
