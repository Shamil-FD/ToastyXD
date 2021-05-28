### How The Command Template Works

```// Require our custom Command Module
const Command = require('../../Struct/Command.js');

module.exports = class NAME-HERECommand extends Command {
	constructor() {
// The first param serves as the command 'id'. Required
		super('CommandName', {
			aliases: [''],
// The command's category. Required
			category: '',
// Remove this to make the command accessible from anywhere or you set where the command is accessible in dm or guild.  Optional
			channel: 'guild','
// Set the command only be accessible by guild Staff. Optional
            staffOnly: Boolean,
// Set the command only be accessible by the Staff Manager aka losers. Optional
             managerOnly: Boolean,
// Command info and usages. Optional
			description: {
				info: '',
				usage: ['t)'],
			},
// Arguments. Optional
             args: [{}],
// On to the Slash Command part
// If you're going to make the command also accessible on slash commands, then you should put this.
             useSlashCommand: Boolean,
// Slash Command object. Optional
             slashCommand: {
// The name of the slash command. By default it's the command's 'id' as mentioned earlier but you can overwrite it. Optional
              name: 'name',
// The description of the slash command. By default it's description.info and you can overwrite it too. Optional
              description: 'My awesome command',
// Now, on to the argument part of the slash commands. Optional
// The name, description, required, type params are required.
              options: [{ name: 'coolStuff', description: 'cool description', required: Boolean, type: 'A-TYPE'}, { name: 'moreCool', description: ''you the drill'....}]
             }
		});
	}
// This executes the normal command.
	 exec(message) {}
// This executes the slash command. Only required if it's a slash command.
     execSlash(interaction) {}
};
```
