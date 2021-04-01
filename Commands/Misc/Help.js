const Command = require('../../Util/Command.js');

module.exports = class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help', 'commands'],
			category: 'misc',
		});
	}

	exec(message, { command }) {
		const embed = this.client
			.embed()
			.setThumbnail(this.client.user.displayAvatarURL());

		for (const [name, category] of this.handler.categories.filter(
			this.filter(message)
		)) {
			embed.addField(
				`${this.client.arrow} ${name.replace(/(\b\w)/gi, (str) =>
					str.toUpperCase()
				)} [${category.size}]`,
				category
					.filter((cmd) => (cmd.aliases ? cmd.aliases.length > 0 : false))
					.map((cmd) => `\`${cmd.aliases[0]}\``)
					.join(', ') || 'Bug!'
			);
			embed
				.setTitle(this.client.arrow + ' Commands ❮')
				.setURL('https://github.com/Shamil-FD/ToastyXD');
		}

		return message.send(
			embed.setThumbnail(this.client.user.displayAvatarURL())
		);
	}

	filter(message) {
		return (c) =>
			![
				'flag',
				...(!message.guild
					? []
					: message.member.hasPermission('MANAGE_GUILD', {
							checkAdmin: true,
							checkOwner: true,
					  })
					? ['flag']
					: ['flag']),
			].includes(c.id);
	}
};
