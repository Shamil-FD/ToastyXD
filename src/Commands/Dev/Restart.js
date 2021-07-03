const Command = require('../../Struct/Command.js');
const util = require('util');

module.exports = class RestartCommand extends Command {
  constructor() {
    super('restart', {
      aliases: ['restart'],
      category: 'flag',
      ownerOnly: true,
      quoted: false,
    });
  }

  async exec(message) {
    await message.react('✅');
    require('child_process').execSync('git pull && npm i && pm2 reload Toasty');
  }
};
