const { Command, CommandOptions } = require('discord-akairo');

module.exports = class ToastyModule extends Command {
	constructor(
		id,
		CommandOptions,
		managerOnly,
		staffOnly,
		beta,
		useSlashCommand,
		slashCommand
	) {
		super(id, CommandOptions);
		this.staffOnly = CommandOptions.staffOnly || false;
		this.managerOnly = CommandOptions.managerOnly || false;
		this.beta = CommandOptions.beta || false;
		this.useSlashCommand = CommandOptions.useSlashCommand || false;
		this.slashCommand = {
			name: CommandOptions.slashCommand?.name || id,
			description:
				CommandOptions.slashCommand?.description ||
				CommandOptions.description?.info ||
				'None provided.',
			options: CommandOptions.slashCommand?.options,
		};
	}

	exec() {
		throw new Error('Not implemented!');
	}
	execSlash() {
		throw new Error('Not implemented.');
	}
};
