const { Listener } = require('discord-akairo');

module.exports = class ButtonListener extends Listener {
  constructor() {
    super('button', {
      emitter: 'client',
      event: 'interaction',
    });
  }

  async exec(interaction) {
      if (!interaction.isButton()) return;
      if (!interaction.customID.toLowerCase() == "purgeverify") return;
      if (!interaction.member?.roles.cache.has(this.client.config.StaffRole)) return interaction.followUp({ content: `${interaction.member}, you can't use this button, dummy.`});
      
      interaction.defer(true);      
      let DeleteMessages = await FetchAndDelete(interaction);
      if (DeleteMessages.status === false) {
        let msg = await interaction.channel.send({ content: `There was an error, try again later.\nError: \`\`\`${DeleteMessages.error}\`\`\``});
          await this.client.tools.wait(5000);
          return msg.delete()
      } else if (DeleteMessages.deleted > 0) { 
        let msg = await interaction.channel.send({ content: `Successfully deleted ${DeleteMessages.deleted} messages.`});
          await this.client.tools.wait(5000);
          return msg.delete()
      } else { 
         let msg = await interaction.channel.send({ content: `There are 0 unpinned messages, dummy.`});
          await this.client.tools.wait(5000);
          return msg.delete()        
      }
   }
};

async function FetchAndDelete(interaction) {
  let msgs = await interaction.channel.messages.fetch({ limit: 100 });
   msgs = msgs.filter(m => m.pinned === false);
    try {
    await interaction.channel.bulkDelete(msgs)
    return { status: true, deleted: msgs.size };
    } catch(e) {
    console.log(e);
    return { status: false, error: e };
    } 
}