const Command = require('../../structure/SlashCommand');
const _ = require('lodash');

module.exports = class StaffLeaderboardCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'staffleaderboard',
        category: 'Staff',
        staffLevel: 1,
        description: 'View the server\'s most active staff',  
        cooldownDelay: 5000
      });
    }

    async run(message) {        
        // Variables:
        let { models, embed } = message.client.tools;
        let docs = await models.staff.find();
        let index = 0;
        // Sort, map and send message
        docs = await _.sortBy(docs, (item) => item?.msgInfo?.total);
        docs = await _.reverse(docs);

        return message.reply({ embeds: [embed().setTitle('Staff Leaderboard').setFooter('Format: Total Messages/Daily Average Messages').setDescription(docs.map(item => { 
            index++;
            let total = 0;
            let average = 0;
            if (item.msgInfo?.dailyMsgs.length) {
                for (let i in item.msgInfo?.dailyMsgs) {
                    total += item.msgInfo.dailyMsgs[i]                    
                }
                average = total / item.msgInfo.dailyMsgs.length;
            }
            return `${index}. <@${item.user}> - \`${new Number(item?.msgInfo?.total).toLocaleString("en-GB")}\`/\`${Math.round(average)}\`` }).join('\n'))] })
    }
};