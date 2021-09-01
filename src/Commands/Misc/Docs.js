const Command = require('../../Struct/Command');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const _ = require('lodash');

module.exports = class DocsCommand extends Command {
  constructor() {
    super('docs', {
      aliases: ['docs', 'djs'],
      category: 'misc',
      flags: ['--src'],
      channel: 'guild',
      args: [
        {
          id: 'query',
          type: 'string',
          match: 'rest',
        },
        {
          id: 'src',
          match: 'option',
          flag: '--src=',
        },
      ],
    });
  }
  async exec(message, { query, src }) {
    if (!query)
      return message.reply({
        embeds: [
          {
            description: `Specify something to search for.`,
            color: 'RED',
          },
        ],
      });
    if (!src) {
      const data = await fetch(`https://djsdocs.sorta.moe/v2/embed?src=master&q=${encodeURIComponent(query)}`);
      const json = await data.json();

      if (json == null || !json.description)
        return message.reply({
          embeds: [{ description: 'Nothing found for that!', color: 'RED' }],
        });
      return message.reply({ embeds: [new MessageEmbed(json)] });
    } else if (src) {
      const data = await fetch(`https://djsdocs.sorta.moe/v2/embed?src=${src}&q=${encodeURIComponent(query)}`);
      const json = await data.json();
      if (json == null || !json.description)
        return message.reply({
          embeds: [{ description: 'Nothing found for that!', color: 'RED' }],
        });
      
        json.fields.forEach(str => {
            if (str.value.length > 1048) {
                str.value = _.truncate(str.value, { 'length': 1046 });
                return;
            }
            	return;
        })
        return message.reply({ embeds: [new MessageEmbed(json)] });
    }
  }
};
