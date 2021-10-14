const Command = require('../../structure/SlashCommand');

module.exports = class RestartCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'restart',
        category: 'Dev',
        description: 'Restart me',
        ownerOnly: true
      });
    }

    async run(message, options) {
        await message.reply({ content: 'K', ephemeral: true })
        return require('child_process').execSync('git pull && npm i && pm2 reload Toasty');        
    }
};