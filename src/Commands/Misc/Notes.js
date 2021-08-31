const Command = require('../../Struct/Command.js');
const { MessageActionRow, MessageButton, Formatters } = require('discord.js');

module.exports = class NotesCommand extends Command {
  constructor() {
    super('notes', {
      aliases: ['notes'],
      category: 'misc',
      useSlashCommand: true,
    });
  }

  exec(message) {
      return this.handleNote(message)
  }
  execSlash(message) {
      return this.handleNote(message)      
  }
  async handleNote(message) {
      let msg;
      let index = 0;
      const button = new MessageActionRow().addComponents([new MessageButton().setEmoji('870638670212915291').setCustomId(`back${message.id}`).setStyle('PRIMARY'), new MessageButton().setEmoji('870638701158465566').setCustomId(`next${message.id}`).setStyle('PRIMARY')])      
      let userProfile = await this.client.tools.models.userProfile.findOne({ user: message.member.id });      
      if (!userProfile || !userProfile.notes.length) return message.reply({ embeds: [this.client.tools.embed().setDescription("You don't have any notes!").setColor('RED')] });
      
      if (userProfile.notes.length == 1) {
          return message.reply({ embeds: [this.client.tools.embed().setDescription(`${this.client.config.arrow} Date: ${Formatters.time(new Date(userProfile.notes[0].date), 'f')}\n${this.client.config.arrow} ID: ${userProfile.notes[0].id}\n>>> ${userProfile.notes[0].content}`)], ephemeral: true });
      }
      if (message?.commandId) {
          await message.deferReply({ ephemeral: true });
          msg = message;
          msg.edit = msg.editReply
          msg.edit({ embeds: [this.client.tools.embed().setDescription(`${this.client.config.arrow} Date: ${Formatters.time(new Date(userProfile.notes[index].date), 'f')}\n${this.client.config.arrow} ID: ${userProfile.notes[index].id}\n>>> ${userProfile.notes[index].content}`).setFooter(`Page ${index + 1}/${userProfile.notes.length}`)], components: [button], ephemeral: true })
      } else {
          msg = await message.reply({ embeds: [this.client.tools.embed().setDescription(`${this.client.config.arrow} Date: ${Formatters.time(new Date(userProfile.notes[index].date), 'f')}\n${this.client.config.arrow} ID: ${userProfile.notes[index].id}\n>>> ${userProfile.notes[index].content}`).setFooter(`Page ${index + 1}/${userProfile.notes.length}`)], components: [button] })          
      }
      const collector = message.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 15000 });
        collector.on('collect', async i => {            
            if (i.user.id !== message.member.id) return i.reply({ content: 'This note page is not for you.', ephemeral: true });  
            await collector.resetTimer({ timer: 15000 });
            if (i.customId === `next${message.id}`) {
                index++;                
                if (index == userProfile.notes.length) index = 0;                
            } else if (i.customId === `back${message.id}`){
                index--;
                if (index <= 0) index = userProfile.notes.length;                
            }
            await msg.edit({ embeds: [this.client.tools.embed().setDescription(`${this.client.config.arrow} Date: ${Formatters.time(new Date(userProfile.notes[index]?.date), 'f')}\n${this.client.config.arrow} ID: ${userProfile.notes[index]?.id}\n>>> ${userProfile.notes[index]?.content}`).setFooter(`Page ${index + 1}/${userProfile.notes.length}`)] })
        });

        collector.on('end', collected => {
        	return msg.edit({ components: [] })
        });
  }
};
