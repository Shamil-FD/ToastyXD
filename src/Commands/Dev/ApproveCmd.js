const Command = require('../../Struct/Command.js');
const sourcebin = require('sourcebin');

module.exports = class ApproveCmdCommand extends Command {
  constructor() {
    super('approvecmd', {
      aliases: ['approvecmd'],
      category: 'Dev',
      //ownerOnly: true,
      betaOnly: true,
      args: [
          {
              id: 'id',              
          }
      ]
    });
  }

  async exec(message, { id }) {
      if (!id) return message.reply({ embeds: [this.client.tools.embed().setDescription('You have to provide a message ID dumbass!')] });
      
      let doc = await this.client.tools.models.customCmd.findOne({ msg: id });
      if (!doc) return message.reply({ embeds: [this.client.tools.embed().setDescription('That ID doesn\'t exist on my database dumbass.')] });
      
      if (doc?.approvers.includes(message.author.id)) return message.reply({ embeds: [this.client.tools.embed().setDescription('You already approved it once dumbass.')] });
      
      doc?.approvers.push(message.author.id)
      await doc.save();
      
      if (doc?.approvers.length == 2) {
          try {
              let code = await sourcebin.get(doc.key)
              let codeMsg = await this.client.channels.cache.get('861683396518739978')?.messages.fetch(doc.msg);
              if (!codeMsg) { 
              await doc.delete();
              return message.reply({ embeds: [this.client.tools.embed().setDescription('The message doesn\'t exist!')] }); 
              }
              await codeMsg.edit({ embeds: [this.client.tools.embed().setDescription(codeMsg?.embeds[0]?.description).setAuthor(codeMsg?.embeds[0]?.author?.name, codeMsg?.embeds[0]?.author?.iconURL).setFooter('APPROVED')]});
              
          } catch(e) {
              console.log(e)
              await doc.delete()
              return message.reply({ embeds: [this.client.tools.embed().setDescription('There was an error fetching the sourcebin code.')] })
          }
      }
  }
};
