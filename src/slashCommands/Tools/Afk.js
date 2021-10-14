const Command = require('../../structure/SlashCommand');
let moment = require('moment');
let ms = require('ms');

module.exports = class AFKCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'afk',
        description: 'Set your AFK status', 
        category: 'Tools',
        help: {
            usage: ['afk <reason>'],            
            example: ['afk eating icecream']
        },
        options: [{ name: 'reason', type: 'STRING', description: 'Reason for your AFK' }]        
      });
    }

    async run(message, options) {
        const doc = await message.client.tools.models.afk.findOne({ user: message.user.id });
        let reason;
        if (!options.get('reason')?.value) reason = 'AFK';
        else reason = options.get('reason').value;
        
        if (!doc) {
            await new message.client.tools.models.afk({
               user: message.user.id,
               count: 0,
               date: moment().format(),
               reason: reason,
            }).save();
        } else {
            await doc.delete();
            await new message.client.tools.models.afk({
               user: message.user.id,
               count: 0,
               date: moment().format(),
               reason: reason,
             }).save();
        }
        return message.reply({ embeds: [message.client.tools.embed().setDescription(`${message.user} is now AFK: ${reason}`)] });        
    }
}