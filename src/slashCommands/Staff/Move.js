const Command = require('../../structure/SlashCommand');
const stops = ['https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.rkln437ufbHGTLt_qxousgHaEK%26pid%3DApi&f=1', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.Iu4IKA3yBPdIt7aqUOHi9AHaE8%26pid%3DApi&f=1', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.oHrT3CukLqTBrFsFXM6L3gHaDt%26pid%3DApi&f=1'];
const dontask = ['https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.VuuVGxONVjbYIqH-OCTe1wHaFb%26pid%3DApi&f=1', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.I_KBh7oZSL5wKTBdYqbJPgHaEL%26pid%3DApi&f=1', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.sIIzD2x8ipY3CY-4lut3eQHaDt%26pid%3DApi&f=1', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.FEk5q86i2T-2ABRZHl9vAAHaE7%26pid%3DApi&f=1', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.Zg32WOU2xc3TTw77oVT4VwHaFo%26pid%3DApi&f=1', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.dQNvTQRP5dMlWlr5rz9UeAHaFL%26pid%3DApi&f=1'];

module.exports = class MoveCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'move',
        category: 'Staff',
        staffLevel: 1,
        description: 'Move a conversation to another channel.',  
        cooldownDelay: 5000,
        options: [
            { 
                name: 'channel', type: 'CHANNEL',
                description: 'Channel to move the convo to.', required: true,
                channel_types: [0]                 
            },
        ]
      });
    }

    async run(message, options) {
        const channel = options.get('channel').channel;
        const { embed } = message.client.tools;
        const stopped = stops[Math.floor(Math.random() * stops.length)];
        const neverasked = dontask[Math.floor(Math.random() * dontask.length)];
        
        if (channel.type !== 'GUILD_TEXT')
            return message.reply({
                embeds: [embed().setDescription('Provide me a text channel.').setColor('RED')],
                ephemeral: true
            });
        
        await message.reply({ 
            content: message.client.config.tick,
            ephemeral: true
        });
        
        await message.channel.send({
            embeds: [embed().setDescription(`Please continue this convo in <#${channel.id}>. Failing to do so will result in a warn or mute.`).setColor('RED').setThumbnail(stopped)]
        });
        
        return channel.send({
            embeds: [embed().setDescription(`Feel free to continue the conversation moved from <#${message.channel.id}> to here.`).setColor('GREEN').setThumbnail(neverasked)]
        });
    }
};