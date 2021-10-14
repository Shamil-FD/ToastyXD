const Command = require('../../structure/SlashCommand');

module.exports = class LockdownCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'lockdown',
        category: 'Staff',
        staffLevel: 2,
        description: 'Lock/Unlock the server',  
        cooldownDelay: 15000,
        options: [{ name: 'reason', description: 'Why?', type: 'STRING' }]
      });
    }

    async run(message, options) {        
        // Roles
        const level10 = message.guild.roles.cache.get('751033299220299806');
        const level3 = message.guild.roles.cache.get('813428341050441759');
        const level1 = message.guild.roles.cache.get('751032945648730142');
        const level5 = message.guild.roles.cache.get('751033133180125284');
        const booster = message.guild.roles.cache.get('703874626916188171');
        const friends = message.guild.roles.cache.get('655693994340384768');

        await message.deferReply();
        if (message.client.config.lockingMode === true) 
            return message.editReply({                 
              embeds: [message.client.tools.embed().setDescription("There's already a lockdown process running!").setColor('RED')]                
             });
        message.client.config.lockingMode = true;

        // Channels
        const channels = await message.guild.channels.fetch();
        const channels1 = channels.filter((c) => ['790254009235013663', '709160883607044126'].includes(c.id));
        const channels2 = channels.filter((c) => ['743035689423339521', '762965783575265280'].includes(c.id));
        const channels3 = channels.filter((c) => ['709043328682950716', '709043831995105360', '752983872068780204', '752983993720504340'].includes(c.id));
        const channels5 = channels.filter((c) => ['768536934120816680'].includes(c.id));
        const channels6 = channels.filter((c) => ['709043365727043588'].includes(c.id));

        // Change function
        const change = async (position) => {
          await channels1.forEach(async (c) => {
            // #Development and #Creations
            await c.permissionOverwrites.create(level3, {                
                SEND_MESSAGES: position,
                VIEW_CHANNEL: true,
                READ_MESSAGE_HISTORY: true,
            });
            await c.permissionOverwrites.create(booster, {
                SEND_MESSAGES: position,
                VIEW_CHANNEL: true,
                READ_MESSAGE_HISTORY: true,
            });
          });
          await channels2.forEach(async (c) => {
            // #Boosters and #Self-promo
            await c.permissionOverwrites.create(booster, { SEND_MESSAGES: position, VIEW_CHANNEL: true });
          });
          await channels3.forEach(async (c) => {
            // Ha Normies
            await c.permissionOverwrites.create(message.guild.id, { SEND_MESSAGES: position, VIEW_CHANNEL: true });
          });
          await channels5.forEach(async (c) => {
            // #Vent
            await c.permissionOverwrites.create(level5, { SEND_MESSAGES: position, VIEW_CHANNEL: true });
            await c.permissionOverwrites.create(friends, { SEND_MESSAGES: position, VIEW_CHANNEL: true });
          });
          await channels6.forEach(async (c) => {
            // #Help
            await c.permissionOverwrites.create(level1, { SEND_MESSAGES: position, VIEW_CHANNEL: true });
          });
          return;
        };
        
        try {            
            if (message.client.config.lockdownMode === true) {
                message.client.config.lockdownMode = false;
                await change(true);
                message.client.config.lockingMode = false;
                await message.guild.channels.cache.get('738831994246529084').send({
                    embeds: [message.client.tools.embed().setDescription(`The server has been unlocked by <@${message.author.id}>`).setColor('GREEN')]
                });
                return message.editReply({                    
                    embeds: [message.client.tools.embed().setDescription(`Successfully unlocked the server!`).setColor('GREEN')]
                });
            } else {                
                message.client.config.lockdownMode = true;
                await change(false);
                message.client.config.lockingMode = false;
                await message.guild.channels.cache.get('738831994246529084').send({
                    embeds: [message.client.tools.embed().setDescription(`The server has been locked by <@${message.author.id}> ${options.get('reason')?.value ? ` | ***${options.get('reason')?.value}***` : ''}`).setColor('RED')]
                });
                return message.editReply({                    
                    embeds: [message.client.tools.embed().setDescription(`Successfully locked the server!`).setColor('GREEN')],
                });
            }
        } catch (e) {            
            console.log(e);
            return message.editReply({
                embeds: [message.client.tools.embed().setDescription(`There was an error!\n\`\`\`\n${e.stack}\`\`\``).setColor('RED')]
            });
        }
    }
};