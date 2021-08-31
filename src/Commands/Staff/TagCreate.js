const Command = require('../../Struct/Command.js');

module.exports = class TagsCommand extends Command {
  constructor() {
    super('tagcreate', {
      aliases: ['tagcreate'],
      category: 'Staff',
      description: {
        info: 'Make a custom tag/command',
        usage: ['t)tagcreate TagName TagContent'],
      },
      staffOnly: true,
      useSlashCommand: true,
      args: [
        {
          id: 'name',
        },
        { id: 'content', match: 'rest' }
      ],
      slashCommand: {
        options: [
          {
            name: 'name',
            type: 'STRING',
            description: "Name of the tag",
            required: true,
          },
          {
			name: 'content',
            type: 'STRING',
            description: 'Content of the tag',
            required: true
          }
        ],
      },
    });
  }
  exec(message, { name, content }) {   
      if (!name || !content) return message.reply({ embeds: [this.client.tools.embed().setDescription('Invalid format! You need to provide me the name and content of the tag.').setColor('RED')] })
      return this.handleTag(message, name, content)
  }    
  execSlash(message) {
      return this.handleTag(message, message.options.get('name').value, message.options.get('content').value)      
  }
  async handleTag(message, name, content) {
      name = name.toLowerCase();      
      let doc = await this.client.tools.models.tag.findOne({ name: name });
      if (doc) return message.reply({ embeds: [this.client.tools.embed().setDescription(`**${name}** already exists!`).setColor('RED')] })
      
      await new this.client.tools.models.tag({ name: name, content: content }).save();
      return message.reply({ embeds: [this.client.tools.embed().setDescription(`A tag with the name of **${name}** has been created.`).setFooter('Use t)tagname or s!tagname to use the tag').setColor('GREEN')] });
  }
};
