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
          await interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setColor('RED')
                .setDescription(`${interaction.member}, you can't use this button, dummy.`),
            ],
            ephemeral: true,
          });
          await this.client.tools.wait(5000);
          return interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setColor('RED')
                .setDescription(`Press the button below to delete any unpinned messages.`),
            ],
            ephemeral: true,
          });
        }
        let DeleteMessages = await FetchAndDelete(interaction);
        if (DeleteMessages.status === false) {
          await interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setColor('RED')
                .setDescription(`There was an error, try again later.\nError: \`\`\`${DeleteMessages.error}\`\`\``),
            ],
            ephemeral: true,
          });
          await this.client.tools.wait(5000);
          return interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setColor('RED')
                .setDescription(`Press the button below to delete any unpinned messages.`),
            ],
            ephemeral: true,
          });
        } else if (DeleteMessages.deleted > 0) {
          await interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setColor('GREEN')
                .setDescription(`Successfully deleted ${DeleteMessages.deleted} messages.`),
            ],
            ephemeral: true,
          });
          await this.client.tools.wait(5000);
          return interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setColor('RED')
                .setDescription(`Press the button below to delete any unpinned messages.`),
            ],
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            embeds: [this.client.tools.embed().setColor('RED').setDescription(`There are 0 unpinned messages, dummy.`)],
            ephemeral: true,
          });
          await this.client.tools.wait(5000);
          return interaction.reply({
            embeds: [
              this.client.tools
                .embed()
                .setColor('RED')
                .setDescription(`Press the button below to delete any unpinned messages.`),
            ],
            ephemeral: true,
          });
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
