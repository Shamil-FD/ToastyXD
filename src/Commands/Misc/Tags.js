const Command = require('../../Struct/Command.js');
const _ = require('lodash');

module.exports = class TagsCommand extends Command {
  constructor() {
    super('tags', {
      aliases: ['tags'],
      category: 'misc',
      description: {
        info: 'View custom tags/commands',
        usage: ['t)tags'],
      },
      useSlashCommand: true,
   });
  }
  exec(message) {   
      return this.handleTag(message)
  }    
  execSlash(message) {
      return this.handleTag(message)      
  }
  async handleTag(message) {
      let docs = await this.client.tools.models.tag.find();
      docs = await _.sortBy(docs, (doc) => { return doc.name });      
      if (!docs.length) return message.reply({ embeds: [this.client.tools.embed().setDescription(`There are no tags!`).setColor('RED')] })
      
      return message.reply({ embeds: [this.client.tools.embed().setDescription(docs.map(tag => `\`${tag.name}\``).join(', ')).setTitle(`${docs.length} Tags`).setFooter('Use t)tagname or s!tagname to use the tag').setColor('GREEN')] });
  }
};
