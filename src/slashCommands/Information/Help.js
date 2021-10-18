const Command = require('../../structure/SlashCommand');

module.exports = class HelpCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'help',
        description: 'View my help command',
        category: 'Information',
        help: {
            usage: [`help`, `help <Command>`],
            example: [`help`, `help ping`]
        },
        options: [{ name: 'command', description: 'View info on a command.', type: 'STRING' }]        
      });
    }

    async run(message, options) {
        if (!options.get('command')?.value) {
            return this.giveHelp(message);
        }
        let cmd = this.store.get(options.get('command')?.value);        
        if (!cmd) return this.giveHelp(message);
        
        let embed = message.client.tools.embed()
        .setTitle(`Command: ${cmd.name}`)
        .setDescription(`${cmd?.help?.description.length > 0 ? `Description: ${cmd.help.description}\n` : ''}${cmd?.help?.subCommands.length ? cmd.help.subCommands.map(i => `\`${i}\``).join(', ') : ''}${cmd?.help?.usage?.length > 0 ? `Usages: ${cmd.help.usage.map(item => `\`/${item}\``).join(', ')}\n` : ''}${cmd?.help?.example?.length > 0 ? `Examples: ${cmd.help.example.map(item => `\`/${item}\``).join(', ')}\n` : ''}`)
        return message.reply({ embeds: [embed] });
	}
    async giveHelp(message) {
        let tags = message.client.tags;    
        let tagArray = [];
        let commands = this.store.toJSON();
        let fields = [];
        
        if (message?.guild?.id !== '822925965855424542') {
            commands = commands.filter(cmd => cmd.category !== 'Appeal')
        }
        
        commands.forEach(async cmd => {
            if (!fields.find(({ name }) => name === cmd.category.toLowerCase() )) {
               await fields.push({ name: cmd.category.toLowerCase(), value: [cmd.name] })              
            } else if (!fields.find(({ name }) => name === cmd.category.toLowerCase()).value[cmd.name]) {
                await fields.find(({ name }) => name === cmd.category.toLowerCase()).value.push(cmd.name)
            }
        });
        fields.map(obj => { obj.name = `${message.client.config.arrow} ` + obj.name.replace(/(\b\w)/gi, (str) => str.toUpperCase()); obj.value = obj.value.map(item => `\`${item}\``).join(', '); return obj })
        
        if (tags.size > 0) {
            for (const value of tags.keys()) {
                tagArray.push(value)
            }
            fields.push({ name: `${message.client.config.arrow} Tags`, value: tagArray.map(item => `\`${item}\``).join(', ') });            
        }
        
        return message.reply({ embeds: [message.client.tools.embed().addFields(fields).setTitle('Fresh Toast Menu')] })
    }
};