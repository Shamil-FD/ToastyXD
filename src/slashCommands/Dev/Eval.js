const Command = require('../../structure/SlashCommand');
const { inspect } = require('util');

module.exports = class EvalCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'eval',
        category: 'Dev',
        description: 'Eval',
        ownerOnly: true,
        options: [{ name: 'code', description: 'Le code', type: 'STRING', required: true }]
      });
    }

    async run(message, options) {
        const code = options.get('code')?.value; 
        const clean = (stuff) => {
          if (typeof stuff === 'string') {
            const token = message.client.token.split('').join('[^]{0,2}');
            const revToken = message.client.token.split('').reverse().join('[^]{0,2}');
            const tokenRegex = new RegExp(`${token}|${revToken}`, 'g');
            return stuff.replace(tokenRegex, '[CENSORED HENTAI]');
          } else return stuff;
        };

        try {            
            let evaled = await eval(code);
            if (typeof evaled !== 'string') evaled = inspect(evaled, { depth: 0 });
            let cleaned = [];
            cleaned.push(await clean(evaled));

            let embeds = [];
            for (let ArrNum = 0; ArrNum < cleaned.length; ArrNum++) {
                embeds.push(message.client.tools.embed().setDescription(`\`\`\`${cleaned[ArrNum] ?? 'No output'}\`\`\``));
            }
            return message.reply({ embeds: embeds });
          } catch (err) {
              return message.reply({ content: `Error:\n\`\`\`\n${clean(err.stack)}\n\`\`\`` });
          }
    }
};