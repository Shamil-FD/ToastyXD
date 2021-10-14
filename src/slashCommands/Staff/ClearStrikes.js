const Command = require('../../structure/SlashCommand');

module.exports = class ClearStrikeCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'clearstrikes',
        category: 'Staff',
        staffLevel: 4,
        description: 'Clear strikes of a staff',  
        cooldownDelay: 5000,
        options: [
            { name: 'user', type: 'USER', description: 'The user', required: true },
        ]
      });
    }

    async run(message, options) {
        const user = options.get('user').member;
        const { embed, models } = message.client.tools;
        let doc = await models.staff.findOne({ user: user.id });
        doc.strikes = 0;
        await doc.save();
        
        return message.reply({
          embeds: [embed().setDescription(`Gone! Like it never was there`).setColor('GREEN')]
        });
    }
};