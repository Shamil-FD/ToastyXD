const { Listener } = require('@sapphire/framework');

module.exports = class CommandInteractionListener extends Listener {
  constructor(context) {
    super(context, {
      event: 'interactionCreate',
    });
  }
    async run(interaction) { 
        if (!interaction.isCommand()) return;
        const cmd = this.container.stores.get("slashCommands").get(interaction.commandName);
        if (!cmd) return;
        
        try {
            // Run cooldown
            if (await cmd.runCooldown(this.container.client, interaction)) return;
            // Run Inhibitors
            if (await cmd.runInhibitors(interaction)) return;
            // Limit Using 2 or more commands at the same time
            if (cmd._activeUsers.has(interaction.user.id)) return;
        } catch (e) {
            return console.log(e)
        }
        
        await cmd._activeUsers.set(interaction.user.id, {});
        await cmd.run(interaction, interaction.options);
        return cmd._activeUsers.delete(interaction.user.id);
    }       
};