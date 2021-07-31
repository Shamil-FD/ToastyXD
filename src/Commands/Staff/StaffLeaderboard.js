// prettier-ignore
const Command = require('../../Struct/Command.js');
const _ = require('lodash');

module.exports = class StaffLeaderboardCommand extends Command {
  constructor() {
    super('staffleaderboard', {
      aliases: ['staffleaderboard', 'slb'],
      category: 'Staff',
      description: {
        info: 'View the top most active staff members',
        usage: ['t)staffleaderboard'],
      },
      staffOnly: true,
      useSlashCommand: true,     
    });
  }
  async exec(message) {
      return this.createLeaderboard(message)
  }
  async execSlash(message) {
      return this.createLeaderboard(message)
  }
  async createLeaderboard(message) {
      // Variables:
      let { models, embed } = this.client.tools;
      let docs = await models.staff.find();
      let index = 0;
      // Sort, map and send message
      docs = await _.sortBy(docs, (item) => item?.msgInfo?.total);
      docs = await _.reverse(docs);
      
      return message.reply({ embeds: [embed().setTitle('Staff Leaderboard').setDescription(docs.map(item => { index++; return `${index}. <@${item.user}> - \`${new Number(item?.msgInfo?.total).toLocaleString("en-GB")}\` messages` }).join('\n'))] })
  }
};
