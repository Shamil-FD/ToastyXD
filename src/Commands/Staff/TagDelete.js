const Command = require('../../Struct/Command.js');

module.exports = class TagDeleteCommand extends Command {
  constructor() {
    super('tagdelete', {
      aliases: ['tagdelete'],
      category: 'Staff',
      description: {
        info: 'Delete a custom tag/command',
        usage: ['t)tagdelete TagName'],
      },
      staffOnly: true,
      useSlashCommand: true,
      args: [
        {
          id: 'name',
        },
      ],
      slashCommand: {
        options: [
          {
            name: 'name',
            type: 'STRING',
            description: "Name of the tag",
            required: true,
          },          
        ],
      },
    });
  }
  exec(message, { name }) {   
      if (!name) return message.reply({ embeds: [this.client.tools.embed().setDescription('Invalid format! You need to provide me the name of the tag.').setColor('RED')] })
      return this.handleTag(message, name)
  }    
  execSlash(message) {
      return this.handleTag(message, message.options.get('name').value)      
  }
  async handleTag(message, name) {
      name = name.toLowerCase();      
      let doc = await this.client.tools.models.tag.findOne({ name: name });
      if (!doc) return message.reply({ embeds: [this.client.tools.embed().setDescription(`**${name}** does not exist.`).setColor('RED')] })
      
      await doc.delete()
      return message.reply({ embeds: [this.client.tools.embed().setDescription(`A tag with the name of **${name}** has been deleted.`).setColor('GREEN')] });
  }
};
