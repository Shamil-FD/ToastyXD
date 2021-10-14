const SlashCommand = require("./SlashCommand.js");
const { Store } = require("@sapphire/framework");

class SlashCommandStore extends Store {    
  	constructor() {
    	super(SlashCommand, { name: "slashCommands" });
  	}
  	async registerCommands() {
    	const client = this.container.client;
    	if (!client) return;
    	const slashCommands = this.container.stores.get("slashCommands");
        client.guilds.cache.forEach(g => g?.commands.set(slashCommands.map(c => c.commandData)))
  	}
};

module.exports = SlashCommandStore;