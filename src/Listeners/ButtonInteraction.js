const { Listener } = require('discord-akairo');

module.exports = class ButtonListener extends Listener {
  constructor() {
    super('button', {
      emitter: 'client',
      event: 'interaction',
    });
  }

  async exec(interaction) {
    if (interaction.isButton()) {
      if (interaction.customID.toLowerCase() == 'purgeverify') {
        await interaction.defer(true);          
        if (!interaction.member?.roles.cache.has(this.client.config.StaffRole)) {
          await interaction.editReply({ embeds: [this.client.tools.embed().setColor('RED').setDescription(`${interaction.member}, you can't use this button, dummy.`)] });
          await this.client.tools.wait(5000);            
          return interaction.editReply({ embeds: [this.client.tools.embed().setColor('RED').setDescription(`Press the button below to delete any unpinned messages.`)] })
        }
        let DeleteMessages = await FetchAndDelete(interaction);
        if (DeleteMessages.status === false) {
          await interaction.editReply({ embeds: [this.client.tools.embed().setColor('RED').setDescription(`There was an error, try again later.\nError: \`\`\`${DeleteMessages.error}\`\`\``)] });
          await this.client.tools.wait(5000);            
          return interaction.editReply({ embeds: [this.client.tools.embed().setColor('RED').setDescription(`Press the button below to delete any unpinned messages.`)] })            
        } else if (DeleteMessages.deleted > 0) {
          await interaction.editReply({ embeds: [this.client.tools.embed().setColor('GREEN').setDescription(`Successfully deleted ${DeleteMessages.deleted} messages.`)] });
          await this.client.tools.wait(5000);            
          return interaction.editReply({ embeds: [this.client.tools.embed().setColor('RED').setDescription(`Press the button below to delete any unpinned messages.`)] })            
        } else {
          await interaction.editReply({ embeds: [this.client.tools.embed().setColor('RED').setDescription(`There are 0 unpinned messages, dummy.`)] });
          await this.client.tools.wait(5000);            
          return interaction.editReply({ embeds: [this.client.tools.embed().setColor('RED').setDescription(`Press the button below to delete any unpinned messages.`)] })          
        }
      }
    }
  }
};

async function FetchAndDelete(interaction) {
  let msgs = await interaction.channel.messages.fetch({ limit: 100 });
  msgs = msgs.filter((m) => m.pinned === false);
  try {
    await interaction.channel.bulkDelete(msgs);
    return { status: true, deleted: msgs.size };
  } catch (e) {
    console.log(e);
    return { status: false, error: e };
  }
}
