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
    if (message.channel.type === 'GUILD_TEXT') {
      // Staff Check-In Stuff
      if (message.member.roles.cache.has('752632482943205546') === true) {
        if (message.content.toLowerCase().startsWith(this.client.config.prefix)) return;
        if (message.content.length === 1) return;
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
              randomCount: rannum() + 100,
            },
          }).save();
        } else {
          if (!['709043831995105360', '781221115271970826', '853552430515093534'].includes(message.channel.id)) {
            doc.msgInfo.today++;
          }
          doc.msgInfo?.total ? doc.msgInfo.total++ : (doc.msgInfo.total = 1);
          await doc.save();
        }
        if (['709043831995105360', '781221115271970826', '853552430515093534'].includes(message.channel.id)) return;
        doc = await models.staff.findOne({ user: message.author.id });
        // If A Staff's Total Message Count Is Equal To Or Greater Than Their Daily Message Count Then Execute These
        if (doc.msgInfo?.today > doc.msgInfo?.dailyCount) {
          let clockchnl = await message.guild.channels.cache.get('733307358070964226');

          // Fetching The Clocked In Message
          await clockchnl.messages.fetch('777522764525338634').then(async (msgs) => {
            // Add The Staff Into The Checked In Message If They Aren't There
            if (!msgs.embeds[0].description.includes(message.author.tag)) {
              await msgs.edit({
                embeds: [
                  this.client.tools
                    .embed()
                    .setDescription(
                      msgs.embeds[0].description +
                        `\n${this.client.config.tick} ${message.author.tag} - ${doc.msgInfo?.dailyCount} messages today`,
                    )
                    .setColor('GREEN')
                    .setFooter(msgs.embeds[0].footer ? msgs.embeds[0].footer.text : ''),
                ],
              });
            }
          });

          // Fetching The Not Clocked In Message
          const NotCheckedIn = await clockchnl.messages.fetch('804073813163376650');
          // Remove The Staff From The Not Checked In Message If They Are There
          if (NotCheckedIn.embeds[0].description.includes(message.author.tag)) {
            let ReplacedMsg = NotCheckedIn.embeds[0].description.replace(`:x: ${message.author.tag}`, '');
            ReplacedMsg = ReplacedMsg.replace(/(^[ \t]*\n)/gm, '');
            NotCheckedIn.edit({
              embeds: [this.client.tools.embed().setDescription(ReplacedMsg).setColor('RED')],
            });
          }
        }
      }
    }
  }
};
