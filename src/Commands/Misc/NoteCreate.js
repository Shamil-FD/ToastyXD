const Command = require('../../Struct/Command.js');

module.exports = class NoteCreateCommand extends Command {
  constructor() {
    super('notecreate', {
      aliases: ['notecreate'],
      category: 'misc',
      useSlashCommand: true,
      args: [{ id: 'content', match: 'content' }],
      slashCommand: { options: [{ name: 'content', description: 'Note content', required: true, type: 'STRING' }] }
    });
  }

  exec(message, { content }) {
      if (!content) return message.reply({ embeds: [this.cluent.tools.embed().setDescription('You need to provide me the content of the note.')] });
      return this.handleNote(message, content)
  }
  execSlash(message) {
      return this.handleNote(message, message.options.get('content').value)      
  }
  async handleNote(message, content) {
      let userProfile = await this.client.tools.models.userProfile.findOne({ user: message.member.id });
      const id = await this.client.tools.randomId(7); 
      if (!userProfile) {
          await this.client.tools.models.userProfile({ user: message.member.id, notes: [{ id: id, content: content, date: new Date()}]}).save()
      } else {
          userProfile.notes.push({ id: id, content: content, date: new Date() });
          await userProfile.save()
      }
      return message.reply({ embeds: [this.client.tools.embed().setDescription(`New note created!\n>>> ID: ${id}\nContent: ${content}`).setColor('GREEN').setFooter('Use t)notes command to view your notes.')], ephemeral: true });
  }
};
