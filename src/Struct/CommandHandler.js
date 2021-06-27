const { CommandHandlerEvents, CommandHandler, CommandHandlerOptions } = require('discord-akairo');
const { Collection } = require('discord.js');

module.exports = class ToastyHandler extends CommandHandler {
  constructor(client, CommandHandlerOptions) {
    super(client, CommandHandlerOptions);
    this.slashCommands = new Collection();
    this.setup2();
  }

  setup2() {
    this.client.once('ready', async () => {
      // Register all the slash commands to the gu8ld.
      let guild = await this.client.guilds.cache.get('655109296400367618');
      if (guild) guild.commands?.set(this.slashCommands);

      // Slash Command Handler.
      this.client.on('interaction', async (interaction) => {
        try {
          this.handleSlash(interaction);
        } catch (e) {
          return this.emit('slashError', e, interaction, interaction.commandName);
        }
      });
    });
  }
  // Load all the slash commands to a collection.
  async register(command, filepath) {
    super.register(command, filepath);
    if (command.useSlashCommand === true) {
      let SlashCmdExists = this.slashCommands.get(command.id);
      if (!SlashCmdExists) {
        await this.slashCommands.set(command.id, command.slashCommand);
      }
    }
  }
  async handleSlash(interaction) {
    // Check if the interaction is a command.
    if (!interaction.isCommand()) return true;
    // Get the command
    let slashCmd = this.modules.get(interaction.commandName);
    if (!slashCmd) return false;
    // Add interaction.author since it doesn't exist on interactions
    interaction.author = interaction.member?.user;

    // Check Command use permissions
    let RejectReply = () => {
      return interaction.reply("You can't use this command.");
    };
    if (slashCmd?.ownerOnly === true && !this.client.ownerID.includes(interaction.member.id)) return RejectReply();
    if (
      !this.client.ownerID.includes(interaction.member.id) ||
      !interaction.member.roles.cache.has(this.client.config.StaffManagerRole)
    ) {
      if (slashCmd?.managerOnly === true && !interaction.member.roles.cache.has(this.client.config.StaffManagerRole))
        return RejectReply();
      else if (slashCmd?.adminOnly === true && !interaction.member.roles.cache.has(this.client.config.AdminRole))
        return RejectReply();
      else if (slashCmd?.staffOnly === true && !interaction.member.roles.cache.has(this.client.config.StaffRole))
        return RejectReply();
    }

    try {
      if(await this.runCooldowns(interaction, slashCmd) === false){
      return slashCmd.execSlash(interaction);
      } else return false
    } catch (e) {
      this.emit('slashError', e, interaction, slashCmd);
      return false;
    }
    return false;
  }
};
