const { Piece } = require("@sapphire/framework");
const { Collection } = require('discord.js')
const prettyMs = require('pretty-ms');

class ToastyCommand extends Piece {
  constructor(context, CommandOptions) {
        super(context, CommandOptions);
        this._cooldowns = new Collection();
        this._activeUsers = new Collection();
        this.staffLevel = CommandOptions.staffLevel || 0;
        this.appealServerOnly = CommandOptions.appealServerOnly || false;
        this.ownerOnly = CommandOptions.ownerOnly || false;
        this.cooldownDelay = CommandOptions.cooldownDelay || 3000;        
        this.category = CommandOptions.category;
        this.subCommands = CommandOptions.subCommands || [];
        this.help = {
                name: CommandOptions?.name,
                description: CommandOptions?.description ?? '',
                usage: CommandOptions.help?.usage ?? [],
                example: CommandOptions.help?.example ?? [],
                subCommands: CommandOptions.subCommands || []
        };
        this.commandData = {
          name: CommandOptions.name,
          description: CommandOptions.description ?? "No description provided",
          options: CommandOptions.options ?? [],
          defaultPermission: CommandOptions.defaultPermission ?? true
        };        
    }
    run(interaction, options) {
        if (this.subCommands.length > 0) {            
            const subCommand = interaction.options.getSubcommand(false);       
            const cmdFunction = Reflect.get(this, `run${subCommand.replace(/(\b\w)/gi, (str) => str.toUpperCase())}`)
            if (cmdFunction) { 
                return Reflect.apply(cmdFunction, `run${subCommand.replace(/(\b\w)/gi, (str) => str.toUpperCase())}`, [interaction, interaction.options]);
            }
            return interaction.reply("Someone forgot to complete this command..")
        }
        return new Error('No run function found.')
    }
    async runCooldown(client, interaction) {
        try {
            const user = this._cooldowns.get(interaction.user.id);        
            if (!user) {
                this._cooldowns.set(interaction.user.id, { then: Date.now() })
                return false;
            }

            if (user.then > (Date.now() - this.cooldownDelay)) {               
                await interaction.client.emit('commandBlocked', interaction, `Please wait \`${prettyMs((user.then + this.cooldownDelay) - Date.now())}\` before using \`${interaction.commandName}\` again.`);
                return true;
            } 
    
            this._cooldowns.set(interaction.user.id, { then: Date.now() })        
            return false;
        } catch(e) {
            console.log(e)
            return true;
        }
    }
    async runInhibitors(interaction) {
        try {
            if (this.appealServerOnly === true) { 
                if (interaction.guild?.id !== '822925965855424542') {
                    await interaction.client.emit('commandBlocked', interaction, 'This can\'t be used in here');
                    return true;
                }
            }
       
            if (this.ownerOnly === true) {
                if (!interaction.client.config.ownerID.includes(interaction.user.id)) {
                    await interaction.client.emit('commandBlocked', interaction, 'Oopsies you can\'t use this >_<');
                    return true;
                }
            }
       
            let checkStaffLevel = async () => {
                if (this.staffLevel == 1) { 
                    if (!interaction.member.roles.cache.has('752632482943205546')) { 
                        await interaction.client.emit('commandBlocked', interaction, "Bruh, be a staff.");
                        return true
                    }
                    else return false
                } else if (this.staffLevel == 2) {
                    if (!interaction.member.roles.cache.has('657615861372420097')) {
                        await interaction.client.emit('commandBlocked', interaction, "Dude, only when you're a Moderator. got it?");
                        return true
                    }
                    else return false
                } else if (this.staffLevel == 3) {
                    if (!interaction.member.roles.cache.has('655109748030439433')) {
                       await interaction.client.emit('commandBlocked', interaction, "Too bad, be an Admin then come back. Sorry not sorry.");
                       return true
                    }
                    else return false
                } else if (this.staffLevel == 4) {
                    if (!interaction.member.roles.cache.has('715946319734243440')) {
                        interaction.client.emit('commandBlocked', interaction, "Only thy highest of highest can access thy command, peasant!");
                        return true
                    }
                    else return false
                }
            }
            
            if (interaction?.guild?.id && this.staffLevel > 0 && !interaction.client.config.ownerID.includes(interaction.user.id)) {
                if (await checkStaffLevel() == true) return true;
            }
            return false;
        } catch(e) {
            console.log(e)
            return true;        
        }
    }
}; 

module.exports = ToastyCommand;