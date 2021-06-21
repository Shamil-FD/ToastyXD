const moment = require('moment');
const Command = require('../../Struct/Command.js');

module.exports = class ResetCheckinCommand extends Command {
  constructor() {
    super('resetcheckin', {
      aliases: ['resetcheckin'],
      category: 'Staff Management',
      channel: 'guild',
      cooldown: 240000,
      managerOnly: true,
    });
  }

  async exec(message) {
    let { models, rannum } = this.client;
    let sal = this.client.guilds.cache.get('655109296400367618');
    let channel = await this.client.channels.cache.get('733307358070964226');
    let msg = await channel.messages.fetch('777522764525338634');
    let clockin = await this.client.channels.cache.get('768164438627844127');
    let anmsg = await channel.messages.fetch('804073813163376650');
    let mcount = [];

    let lev = await models.leave.find();
    let doc = await models.staff.find();

    // Check Every Staff's Document
    doc.forEach(async (d) => {
      // Save The Message Count To An Array And Reset Their Message Count
      await mcount.push(`Messages: ${d.msgs} - <@${d.user}>`);
      d.msgs = 0;
      d.save();
    });

    await clockin.send({
      embeds: [
        this.client
          .embed()
          .setDescription(msg.embeds[0].description + `\n\n${mcount.join('\n')}`)
          .setFooter(msg.embeds[0].footer ? msg.embeds[0].footer.text : ''),
      ],
    });
    msg.edit({
      embeds: [
        this.client
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
        this.client
          .embed()
          .setDescription(
            `Staff who aren't active today\n${staffRole.members.map((m) => `:x: ${m.user.tag}`).join('\n')}`,
          ),
      ],
    });
    return message.react(this.client.tick);
  }
};
