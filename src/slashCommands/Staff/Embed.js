const Command = require('../../structure/SlashCommand');
const moment = require('moment');

module.exports = class EmbedCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'embed',
        category: 'Staff',
        staffLevel: 1,
        description: 'Make an embed',  
        cooldownDelay: 5000,
        options: [            
            {                
                name: 'channel', type: 'CHANNEL', 
                description: 'The channel you want the embed to be sent.', required: true, 
                channel_types: [0] 
            },
            {
                name: 'description', type: 'STRING',
                description: 'Description of the embed.', required: true,
            },
            {
                name: 'ping', type: 'BOOLEAN',
                description: "If the bot should ping @everyone. USE THIS ONLY IF IT'S NEEDED.",
            },
            {
                name: 'title', type: 'STRING',
                description: 'Title of the embed.',
            },
            {
                name: 'color', type: 'STRING',
                description: 'Color of the embed.',
            },
            {
                name: 'footer', type: 'STRING',
                description: 'Footer of the embed.',
            }
        ]
      });
    }

    async run(message, options) {
        const title = options.get('title')?.value || null;
        const color = options.get('color')?.value || null;
        const description = options.get('description').value;
        const footer = options.get('footer')?.value || null;
        const channel = options.get('channel').channel;
        
        if (footer && footer.length > 1029) {            
            footer = _.truncate(footer, {                
                length: footer.length - `.. | ${message.member.displayName}`.length,
                omission: `.. | ${message.member.displayName}`,                
                });
        }

        let embed = message.client.tools.embed().setDescription(description);
        title ? embed.setTitle(title) : null;
        color ? embed.setColor(color) : null;
        footer
          ? embed.setFooter(footer + `| ${message.member.displayName}`, message.member.user.displayAvatarURL({ dynamic: true }))
          : embed.setFooter(message.member.displayName, message.member.user.displayAvatarURL({ dynamic: true }));

        if (options.get('ping')?.value)
          await message.guild.channels.cache.get('850627411698647050').send({
              embeds: [message.client.tools.embed().setDescription(`${message.member.user.tag} | ${message.member.id} used @/everyone ping on /embed that was sent in <#${channel.id}>. Message was sent at <t:${moment().unix()}:R>`)] 
          });
        
        await channel.send({ content: options.get('ping')?.value ? '@everyone' : null, embeds: [embed] });
        return message.reply({ content: 'Sent.', ephemeral: true });
    }
};