const Command = require('../../Struct/Command.js');
const { splitMessage } = require('discord.js').Util;
const { inspect } = require('util');

module.exports = class EvalCommand extends Command {
  constructor() {
    super('eval', {
      aliases: ['eval'],
      category: 'Dev',
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
        const token = this.client.token.split('').join('[^]{0,2}');
        const revToken = this.client.token.split('').reverse().join('[^]{0,2}');
        const tokenRegex = new RegExp(`${token}|${revToken}`, 'g');
        return stuff.replace(tokenRegex, '[CENSORED HENTAI]');
      } else return stuff;
    };

    try {
      let evaled = await eval(code);

      if (typeof evaled !== 'string') evaled = inspect(evaled, { depth: 0 });
      evaled = await splitMessage(evaled, { maxLength: 3000 });
      let cleaned = [];
      for (let i = 0; i < evaled.length; i++) {
        cleaned.push(await clean(evaled[i]));
      }
      evaled = cleaned;

      let replyDeleted = false;
      (await message.fetch()) ? (replyDeleted = false) : (replyDeleted = true);

      let embeds = [];
      for (let ArrNum = 0; ArrNum < evaled.length; ArrNum++) {
        embeds.push(this.client.tools.embed().setDescription(`\`\`\`${evaled[ArrNum]}\`\`\``));
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
