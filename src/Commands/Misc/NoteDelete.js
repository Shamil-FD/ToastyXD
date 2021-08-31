const Command = require('../../Struct/Command.js');

module.exports = class NoteDeleteCommand extends Command {
  constructor() {
    super('notedelete', {
      aliases: ['notedelete'],
      category: 'misc',
      useSlashCommand: true,
      args: [{ id: 'id', type: 'number' }],
      slashCommand: { options: [{ name: 'id', description: 'The ID of the note you want to delete.', required: true, type: 'NUMBER' }] }
    });
  }

  exec(message, { id }) {
      if (!id) return message.reply({ embeds: [this.cluent.tools.embed().setDescription('You need to provide me the id of the note you want to delete.')] });
      return this.handleNote(message, id)
  }
  execSlash(message) {
      return this.handleNote(message, message.options.get('id').value)      
  }
  async handleNote(message, id) {
      let userProfile = await this.client.tools.models.userProfile.findOne({ user: message.member.id });
      if (!userProfile || !userProfile.notes.length) {
          return message.reply({ embeds: [this.client.tools.embed().setDescription("You don't have any notes!").setColor('RED')] })
      } else {
          if (!userProfile.notes.filter(notes => notes.id === id)) {
              return message.reply({ embeds: [this.client.tools.embed().setDescription(`A note with the ID of ${id} does not exist!`)] })
          }
          userProfile.notes = userProfile.notes.filter(notes => notes.id !== id);
          await userProfile.save()
      }
      return message.reply({ embeds: [this.client.tools.embed().setDescription(`${this.client.config.tick} Deleted note.`).setColor('GREEN')] });
  }
};
