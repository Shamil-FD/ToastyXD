const Command = require('../../Struct/Command.js');

module.exports = class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help', 'commands'],
      category: 'misc',
      args: [{ id: 'comd', type: 'commandAlias' }],
      useSlashCommand: true,
      slashCommand: {
        options: [
          {
            name: 'command',
            description: 'Get info on a command',
            required: false,
            type: 'STRING',
          },
        ],
      },
    });
  }

  exec(message, { comd }) {
    if (comd) {
      if (comd.description) {
        return message.reply({
          embeds: [
            {
              title: `Command: ${comd.id}`,
              description: `${this.client.config.arrow} **Info**: ${comd.description.info}\n${
                this.client.config.arrow
              } **Usage**: ${comd.description.usage.map((u) => `\`${u}\``).join('\n')}\n${
                comd.aliases.length > 1
                  ? `${this.client.config.arrow} **Aliases**: ${comd.aliases
                      .slice(0)
                      .map((a) => `\`${a}\``)
                      .join(', ')}`
                  : ''
              }`,
            },
          ],
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
    if (message.options.get('command')?.value) {
      comd = this.handler.findCommand(message.options.get('command')?.value.toLowerCase());
    }
    if (comd) {
      if (comd.description) {
        return message.reply({
          embeds: [
            {
              title: `Command: ${comd.id}`,
              color: 'BLURPLE',
              description: `${this.client.config.arrow} **Info**: ${comd.description.info}\n${
                this.client.config.arrow
              } **Usage**: ${comd.description.usage.map((u) => `\`${u}\``).join('\n')}\n${
                comd.aliases.length > 1
                  ? `${this.client.config.arrow} **Aliases**: ${comd.aliases
                      .slice(0)
                      .map((a) => `\`${a}\``)
                      .join(', ')}`
                  : ''
              }`,
            },
          ],
        });
      } else {
        return helpCmd(this.handler, this.client, message);
      }
    } else {
      return helpCmd(this.handler, this.client, message);
    }
  }
};

function helpCmd(handler, client, message) {
  let fields = [];
  for (const [name, category] of handler.categories.filter(
    (cm) => !['flag', message.guild.id === '655109296400367618' ? 'appeal' : []].includes(cm.id),
  )) {
    fields.push({
      name: `${client.config.arrow} ${name.replace(/(\b\w)/gi, (str) => str.toUpperCase())}`,
      value:
        category
          .filter((cmd) => (cmd.aliases ? cmd.aliases.length > 0 : false))
          .map((cmd) => `\`${cmd.aliases[0]}\``)
          .join(', ') || 'Bug!',
    });
  }
  return message.reply({
    embeds: [
      client.tools
        .embed()
        .setTitle(client.config.arrow + ' Commands ❮')
        .setURL('https://youtube.com/watch?v=dQw4w9WgXcQ')
        .addFields(fields)
        .setThumbnail(message.member?.user?.displayAvatarURL({ dynamic: true })),
    ],
  });
}
