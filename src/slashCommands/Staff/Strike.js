const Command = require('../../structure/SlashCommand');

module.exports = class StrikeCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'strike',
        category: 'Staff',
        staffLevel: 4,
        description: 'Strike a staff',  
        cooldownDelay: 5000,
        options: [
            { name: 'user', type: 'USER', description: 'The user', required: true },
            { name: 'reason', type: 'STRING', description: 'Why', required: true }
        ]
      });
    }

    async run(message, options) {
        const user = options.get('user').member;
        const reason = options.get('reason').value;
        const { embed, models } = message.client.tools;
        let doc = await models.staff.findOne({ user: user.id });
        doc.strikes ? doc.strikes++ : (doc.strikes = 1);
        await doc.save();
        
        await user.send({ embeds: [embed().setDescription(`You've been given a strike for **${reason}**`).setColor('RED')] }).catch(() => { 
            message.client.channels.cache.get(message.client.config.staffReportChnl).send({ embeds: [embed().setDescription(`<@${user.id}>, you've been given a strike for **${reason}**`).setColor('RED')] })
        });
        return message.reply({
          embeds: [embed().setDescription(`Striked ${user} for ${reason}. They now have ${doc.strikes} strike(s).`).setColor('RED')]
        });
    }
};