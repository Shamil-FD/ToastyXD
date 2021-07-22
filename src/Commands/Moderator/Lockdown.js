const Command = require('../../Struct/Command.js');

module.exports = class LockDownCommand extends Command {
  constructor() {
    super('lockdown', {
      aliases: ['lockdown'],
      category: 'Moderator',
      channel: 'guild',
      cooldown: 15000,
      description: {
        info: 'Lock the server. USE THIS CAREFULLY. USE THIS COMMAND TO LOCK AND UNLOCK THE SERVER',
        usage: ['t)lockdown'],
      },
      moderatorOnly: true,
    });
  }

  async exec(message) {
    // Roles
    let level10 = message.guild.roles.cache.get('751033299220299806');
    let level3 = message.guild.roles.cache.get('813428341050441759');
    let level1 = message.guild.roles.cache.get('751032945648730142');
    let level5 = message.guild.roles.cache.get('751033133180125284');
    let booster = message.guild.roles.cache.get('703874626916188171');
    let friends = message.guild.roles.cache.get('655693994340384768');
    let verify = message.guild.roles.cache.get(this.client.config.NotVerifiedRole);
      
    let msg = await message.reply({ embeds: [this.client.tools.embed().setDescription('Please wait..')] });
    if (this.client.config.lockingMode === true) msg.edit({ embeds: [this.client.tools.embed().setDescription('There\'s already a lockdown process running!').setColor('RED')] });
    this.client.config.lockingMode = true;
    
     // Channels
     let channels = await message.guild.channels.fetch();
     let channels1 = channels.filter(c => ['790254009235013663',  '709160883607044126'].includes(c.id))
     let channels2 = channels.filter(c => ['743035689423339521', '762965783575265280'].includes(c.id))
     let channels3 = channels.filter(c => ['709043328682950716', '709043831995105360', '752983872068780204', '752983993720504340'].includes(c.id))
     let channels4 = channels.filter(c => ['781221115271970826'].includes(c.id))
     let channels5 = channels.filter(c => ['768536934120816680'].includes(c.id)) 
     let channels6 = channels.filter(c => ['709043365727043588'].includes(c.id))
     let channels7 = channels.filter(c => ['801877313855160340'].includes(c.id))
     
     // Change function
     let change = async(position) => {
         await channels1.forEach(async(c) => {
              // #Development and #Creations
              await c.permissionOverwrites.create(level3, { SEND_MESSAGES: position, VIEW_CHANNEL: true, READ_MESSAGE_HISTORY: true });              
              await c.permissionOverwrites.create(booster, { SEND_MESSAGES: position, VIEW_CHANNEL: true, READ_MESSAGE_HISTORY: true });
          });
          await channels2.forEach(async(c) => {             
              // #Boosters and #Self-promo
              await c.permissionOverwrites.create(booster, { SEND_MESSAGES: position, VIEW_CHANNEL: true });              
          })
          await channels3.forEach(async(c) => {             
              // Normies
              await c.permissionOverwrites.create(message.guild.id, { SEND_MESSAGES: position, VIEW_CHANNEL: true });              
          })
          await channels4.forEach(async(c) => {             
              // #Special Bot Command
              await c.permissionOverwrites.create(level10, { SEND_MESSAGES: position, VIEW_CHANNEL: true });              
          })
          await channels5.forEach(async(c) => {             
              // #Vent
              await c.permissionOverwrites.create(level5, { SEND_MESSAGES: position, VIEW_CHANNEL: true });              
              await c.permissionOverwrites.create(friends, { SEND_MESSAGES: position, VIEW_CHANNEL: true });              
          })
          await channels6.forEach(async(c) => {             
              // #Help
              await c.permissionOverwrites.create(level1, { SEND_MESSAGES: position, VIEW_CHANNEL: true });              
          })
          await channels7.forEach(async(c) => {             
              // #Verify
              await c.permissionOverwrites.create(verify, { SEND_MESSAGES: position, VIEW_CHANNEL: true });              
          })
         return;
     }
      try {
         if (this.client.config.lockdownMode === true) {
             this.client.config.lockdownMode = false
             await change(true)
             this.client.config.lockingMode = false;
             await message.guild.channels.cache.get('738831994246529084').send({ embeds: [this.client.tools.embed().setDescription(`The server has been unlocked by <@${message.author.id}>`).setColor('GREEN')] })
             return msg.edit({ embeds: [this.client.tools.embed().setDescription(`Successfully unlocked the server!`).setColor('GREEN')] })
         } else {
             this.client.config.lockdownMode = true
             await change(false)
             this.client.config.lockingMode = false;
             await message.guild.channels.cache.get('738831994246529084').send({ embeds: [this.client.tools.embed().setDescription(`The server has been locked by <@${message.author.id}>`).setColor('RED')] })
             return msg.edit({ embeds: [this.client.tools.embed().setDescription(`Successfully locked the server!`).setColor('GREEN')] })
		} 
      } catch(e) {
          console.log(e)
          return msg.edit({ embeds: [this.client.tools.embed().setDescription(`There was an error!\n\`\`\`\n${e.stack}\`\`\``).setColor('RED')] })
      }
  }
};