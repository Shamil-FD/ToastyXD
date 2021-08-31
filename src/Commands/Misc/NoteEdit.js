const Command = require('../../Struct/Command.js');

module.exports = class NoteEditCommand extends Command {
  constructor() {
    super('noteedit', {
      aliases: ['noteedit'],
      category: 'misc',
      useSlashCommand: true,
      args: [{ id: 'id', type: 'number' }, { id: 'content', match: 'rest' }],
      slashCommand: { options: [{ name: 'id', description: 'The ID of the note you want to edit.', required: true, type: 'NUMBER' }, { name: 'newcontent', description: 'The new content of the note', required: true, type: 'STRING' }] }
    });
  }

  exec(message, { id, content }) {
      if (!id) return message.reply({ embeds: [this.cluent.tools.embed().setDescription('You need to provide me the id of the note you want to delete.')] });
      if (!content) return message.reply({ embeds: [this.cluent.tools.embed().setDescription('You need to provide me the new content for the note.')] });
      return this.handleNote(message, id, content)
  }
  execSlash(message) {
      return this.handleNote(message, message.options.get('id').value, message.options.get('content').value)      
  }
  async handleNote(message, id, cnt) {
      let userProfile = await this.client.tools.models.userProfile.findOne({ user: message.member.id });
      if (!userProfile || !userProfile.notes.length) {
          return message.reply({ embeds: [this.client.tools.embed().setDescription("You don't have any notes!").setColor('RED')] })
      } else {
          if (!userProfile.notes.filter(notes => notes.id === id)) {
              return message.reply({ embeds: [this.client.tools.embed().setDescription(`A note with the ID of ${id} does not exist!`)] })
          }
          userProfile.notes.filter(notes => notes.id !== id).content = cnt;
          await userProfile.save()
      }
      return message.reply({ embeds: [this.client.tools.embed().setDescription(`${this.client.config.tick} Edited the note content to ${cnt}.`).setColor('GREEN').setFooter('Use t)notes to view your notes.')], ephemeral: true });
  }
};
