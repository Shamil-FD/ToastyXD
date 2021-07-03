const Command = require('../../Struct/Command.js');
const { splitMessage } = require('discord.js').Util;
const { inspect } = require('util');

module.exports = class EvalCommand extends Command {
  constructor() {
    super('eval', {
      aliases: ['eval'],
      category: 'flag',
      ownerOnly: true,
      quoted: false,
      args: [
        {
          id: 'code',
          match: 'content',
        },
      ],
    });
  }

  async exec(message, { code }) {
    if (!code) return message.reply('No code provided!');
    const clean = (stuff) => {
      if (typeof stuff === 'string') {
        stuff = stuff.replace(new RegExp(this.client.token, 'gi'), '[CENSORED HENTAI]');
        stuff = stuff.replace(new RegExp(this.client.config.Mongo, 'gi'), '[CENSORED HENTAI]');
      } else return stuff;
    };

    try {
      let evaled = eval(code);
      if (typeof evaled != 'string') evaled = inspect(evaled, { depth: 0 });
      evaled = clean(evaled);
      evaled = await splitMessage(evaled, { maxLength: 3000 });

      let replyDeleted = false;
      (await message.fetch()) ? (replyDeleted = false) : (replyDeleted = true);

      let embeds = [];
      for (let ArrNum = 0; ArrNum < evaled.length; ArrNum++) {
        await embeds.push(this.client.tools.embed().setDescription(`\`\`\`${evaled[ArrNum]}\`\`\``));
      }
      if (!replyDeleted) return message.reply({ embeds: embeds });
      else return message.channel.send({ embeds: embeds });
    } catch (err) {
      let replyDeleted = false;
      (await message.fetch()) ? (replyDeleted = false) : (replyDeleted = true);

      if (!replyDeleted) return message.reply({ content: `Error:\n\`\`\`\n${clean(err.stack)}\n\`\`\`` });
      else return message.channel.send({ content: `Error:\n\`\`\`\n${clean(err.stack)}\n\`\`\`` });
    }
  }
};
