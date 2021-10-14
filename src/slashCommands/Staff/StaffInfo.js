const Command = require('../../structure/SlashCommand');
const { MessageAttachment } = require('discord.js');

module.exports = class StaffInfoCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'staffinfo',
        category: 'Staff',
        staffLevel: 1,
        description: 'View your/someone\'s staff card',  
        cooldownDelay: 5000,
        options: [
            { name: 'user', type: 'USER', description: 'A user.', required: false },
        ]
      });
    }

    async run(message, options) {
        const user = options.get('user')?.member ?? message.member;
        const card = await message.client.tools.staffCard(message.client, user)
        return message.reply({ files: [new MessageAttachment(card, `${user.id}card.png`)] })
    }
};