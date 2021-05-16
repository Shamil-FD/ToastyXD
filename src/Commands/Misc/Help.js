const Command = require('../../Struct/Command.js');

module.exports = class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help', 'commands'],
			category: 'misc',
			args: [{ id: 'comd', type: 'commandAlias' }],
		});
	}

	exec(message, { comd }) {
		if (comd) {
			if (comd.description) {
				return message.send({
					embeds: {
						title: `Command: ${comd.id}`,
						description: `${this.client.arrow} **Info**: ${
							comd.description.info
						}\n${this.client.arrow} **Usage**: ${comd.description.usage
							.map((u) => `\`${u}\``)
							.join('\n')}\n${comd.aliases.length > 1 ? `${this.client.arrow} **Aliases**: ${comd.aliases.slice(0).map(a => `\`${a}\``).join(', ')}` : ''}`,
					},
				});
			} else {
				return helpCmd(this.handler, this.client, message);
			}
		} else {
			return helpCmd(this.handler, this.client, message);
		}		
	}
    async execSlash(message) {
        let comd;
        if (message.options[0]?.value){
        comd = this.handler.findCommand(message.options[0]?.value.toLowerCase());  
        }
        if (comd) {
			if (comd.description) {
				return message.reply({
					embeds: [{
						title: `Command: ${comd.id}`,
                        color: 'BLURPLE',
						description: `${this.client.arrow} **Info**: ${
							comd.description.info
						}\n${this.client.arrow} **Usage**: ${comd.description.usage
							.map((u) => `\`${u}\``)
							.join('\n')}\n${comd.aliases.length > 1 ? `${this.client.arrow} **Aliases**: ${comd.aliases.slice(0).map(a => `\`${a}\``).join(', ')}` : ''}`,
					}],
				});
			} else {
            return helpCmd(this.handler, this.client, message, true);
			}
		} else {
			return helpCmd(this.handler, this.client, message, true);
		}		
    } 
};

function helpCmd(handler, client, message, slash) {
			let fields = [];
			for (const [name, category] of handler.categories.filter(
				(cm) => !['flag'].includes(cm.id)
			)) {
				fields.push({
					name: `${client.arrow} ${name.replace(/(\b\w)/gi, (str) => str.toUpperCase())}`,
					value:
						category
							.filter((cmd) => (cmd.aliases ? cmd.aliases.length > 0 : false))
							.map((cmd) => `\`${cmd.aliases[0]}\``)
							.join(', ') || 'Bug!',
				});
			}

    		if (!slash) {
			return message.send({
				embeds: {
					title: client.arrow + ' Commands ❮',
					url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
					fields: fields,
					thumbnail: {
						url: message.author.displayAvatarURL({ dynamic: true }),
					},
				},
			});
        } else {
            return message.reply(client.embed().setTitle(client.arrow + ' Commands ❮').setURL('https://youtube.com/watch?v=dQw4w9WgXcQ').addFields(fields).setThumbnail(message.member?.user?.displayAvatarURL({ dynamic: true })))
        }
}