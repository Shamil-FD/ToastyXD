const Command; = require('../../Struct/Command.js');

module.exports = class **NAMEHERE**Command extends Command {
	constructor() {
		super('CommandName', {
			aliases: ['Aliases'],
			category: '',
			channel: 'dm/guild',
			description: {
				info: '',
				usage: ['t)'],
			},
            managerOnly: true/false,
            staffOnly: true/false,
            useSlashCommand: true/false,
            slashCommand: {
                name: 'OptionalParam',
                description: 'OptionalParam',
                options: [{ name: 'name', description: 'desc', type: 'Type', required: true/false, options: [{}]}, {}]
            },
            args: [{ id: 'argsName', type: 'Type' }]
		});
	}

    exec(message) {}
    execSlash(interaction) {}  
};
