const { Formatters, MessageButton, MessageActionRow } = require('discord.js');
const Command = require('../../structure/SlashCommand');

module.exports = class NotesCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'notes',
        description: 'View/Create/Delete/Edit your notes.', 
        category: 'Tools',
        subCommands: ['create', 'delete', 'edit', 'view'],
        help: {
            usage: ['notes <View/Create/Delete/Edit> <options>'],            
        },
        options: [{ name: 'view', description: 'View all your notes', type: 'SUB_COMMAND' }, { name: 'create', description: 'Create a new note', type: 'SUB_COMMAND', options: [{ name: 'content', description: 'The content of the note.', type: 'STRING', required: true }] }, { name: 'delete', description: 'Delete a note', type: 'SUB_COMMAND', options: [{ name: 'id', description: 'The ID of the note', required: true, type: 'NUMBER' }] }, { name: 'edit', description: 'Edit a note', type: 'SUB_COMMAND', options: [{ name: 'id', description: 'The ID of the note', type: 'NUMBER', required: true }, { name: 'new_content', description: 'The new content of the note', type: 'STRING', required: true }] }]        
      });
    }
    async runView(message, options) {
        let index = 0;
        const button = new MessageActionRow().addComponents([new MessageButton().setEmoji('870638670212915291').setCustomId(`back${message.id}`).setStyle('PRIMARY'), new MessageButton().setEmoji('870638701158465566').setCustomId(`next${message.id}`).setStyle('PRIMARY')])      
        let userProfile = await message.client.tools.models.userProfile.findOne({ user: message.member.id });      
        if (!userProfile || !userProfile.notes.length) return message.reply({ embeds: [message.client.tools.embed().setDescription("You don't have any notes!").setColor('RED')] });

        if (userProfile.notes.length == 1) {
          return message.reply({ embeds: [message.client.tools.embed().setDescription(`${message.client.config.arrow} Date: ${Formatters.time(new Date(userProfile.notes[0].date), 'f')}\n${message.client.config.arrow} ID: ${userProfile.notes[0].id}\n>>> ${userProfile.notes[0].content}`)], ephemeral: true });
        }
          await message.deferReply({ ephemeral: true });
          message.editReply({ embeds: [message.client.tools.embed().setDescription(`${message.client.config.arrow} Date: ${Formatters.time(new Date(userProfile.notes[index].date), 'f')}\n${message.client.config.arrow} ID: ${userProfile.notes[index].id}\n>>> ${userProfile.notes[index].content}`).setFooter(`Page ${index + 1}/${userProfile.notes.length}`)], components: [button], ephemeral: true })

        const collector = message.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 15000 });
        collector.on('collect', async i => {            
            if (i.user.id !== message.member.id) return i.reply({ content: 'This note page is not for you.', ephemeral: true });  
            await collector.resetTimer({ timer: 15000 });
            if (i.customId === `next${message.id}`) {
                index++;                
                if (index == userProfile.notes.length) index = 0;                
            } else if (i.customId === `back${message.id}`){
                index--;
                if (index <= 0) index = (userProfile.notes.length - 1);                
            }
            await message.editReply({ embeds: [message.client.tools.embed().setDescription(`${message.client.config.arrow} Date: ${Formatters.time(new Date(userProfile.notes[index]?.date), 'f')}\n${message.client.config.arrow} ID: ${userProfile.notes[index]?.id}\n>>> ${userProfile.notes[index]?.content}`).setFooter(`Page ${index + 1}/${userProfile.notes.length}`)] })
        });

        collector.on('end', collected => {
            return message.editReply({ components: [] })
        })
    }
    async runEdit(message, options) {
        const id = options.get('id')?.value;
        const content = options.get('new_content')?.value;        
        let userProfile = await message.client.tools.models.userProfile.findOne({ user: message.user.id });
        
        if (!userProfile || !userProfile.notes.length) {
          return message.reply({ embeds: [message.client.tools.embed().setDescription("You don't have any notes!").setColor('RED')] })
        } else {
          if (!userProfile.notes.filter(notes => notes.id === id)) {
              return message.reply({ embeds: [message.client.tools.embed().setDescription(`A note with the ID of ${id} does not exist!`)] })
          }
          userProfile.notes.filter(notes => notes.id !== id).content = content;
          await userProfile.save()
        }
        return message.reply({ embeds: [message.client.tools.embed().setDescription(`${message.client.config.tick} Edited the note content to \`${content}\`.`).setColor('GREEN').setFooter('Use /notes view to view your notes.')], ephemeral: true })
    }
    async runCreate(message, options) {       
        const userProfile = await message.client.tools.models.userProfile.findOne({ user: message.user.id });
        const content = await options.get('content')?.value;
        const id = await message.client.tools.randomId(7); 
        if (!userProfile) {
          await message.client.tools.models.userProfile({ user: message.member.id, notes: [{ id: id, content: content, date: new Date() }]}).save()
        } else {
          userProfile.notes.push({ id: id, content: content, date: new Date() });
          await userProfile.save()
        }
        return message.reply({ embeds: [message.client.tools.embed().setDescription(`New note created!\nContent: ${content}`).setColor('GREEN').setFooter(`ID: ${id} | Use /notes view command to view all your notes.`)], ephemeral: true })
    }
    async runDelete(message, options) {
        const id = options.get('id')?.value;
        let userProfile = await message.client.tools.models.userProfile.findOne({ user: message.user.id });              
        if (!userProfile || !userProfile.notes.length) {
            return message.reply({ embeds: [message.client.tools.embed().setDescription("You don't have any notes!").setColor('RED')] })
        } else {            
            if (!userProfile.notes.filter(notes => notes.id === id)) {
                return message.reply({ embeds: [message.client.tools.embed().setDescription(`A note with the ID of ${id} does not exist!`)] })
            }
            userProfile.notes = userProfile.notes.filter(notes => notes.id !== id);
            await userProfile.save()
        }
        return message.reply({ embeds: [message.client.tools.embed().setDescription(`${message.client.config.tick} Note deleted.`).setColor('GREEN')] })
    }
}