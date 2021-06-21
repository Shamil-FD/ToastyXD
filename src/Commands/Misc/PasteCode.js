let { XMLHttpRequest } = require('xmlhttprequest');
const Command = require('../../Struct/Command.js');
const sourcebin = require('sourcebin');

module.exports = class PasteCodeCommand extends Command {
  constructor() {
    super('pastecode', {
      aliases: ['pastecode', 'pc'],
      category: 'misc',
      channel: 'guild',
      useSlashCommand: true,
      slashCommand: {
        options: [
          {
            name: 'code',
            description: 'Your code.',
            required: true,
            type: 'STRING',
          },
        ],
      },
      args: [
        {
          id: 'cont',
          match: 'content',
        },
      ],
    });
  }

  async exec(message, { cont }) {
    let embed = this.client.embed();
    message.delete();

    if (cont == '<code>' || cont == 'code') {
      return message.channel.send({
        embeds: [
          embed.setDescription(
            "Please replace '<code>'/'code' with your code to paste it in a bin OR send a file with t)pc in the message to paste it in a code bin.",
          ),
        ],
      });
    }
    if (message.attachments.first()) {
      let url = message.attachments.first().url;
      let txtFile = new XMLHttpRequest();

      txtFile.open('GET', url, true);

      txtFile.onreadystatechange = async function () {
        if (txtFile.readyState === 4) {
          if (txtFile.status === 200) {
            let allText = txtFile.responseText;

            sourcebin
              .create(
                [
                  {
                    content: allText,
                    languageId: 'javascript',
                  },
                ],
                {
                  title: message.author.tag,
                  description: 'OwO',
                },
              )
              .then((json) => {
                return message.channel.send(
                  embed
                    .setDescription(`Here's your link: ${json.url}`)
                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                    .setFooter('Thanks for using Toasty'),
                );
              })
              .catch((e) => {
                console.log(e);
                return message.channel.send({
                  embeds: [
                    embed
                      .setDescription('An error occured! Try again')
                      .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true })),
                  ],
                });
              });
          }
        }
      };
      txtFile.send(null);
    } else {
      if (!cont)
        return message.channel.send({
          embeds: [embed.setDescription('You have to provide me either a code or a txt file with your code in it')],
        });
      sourcebin
        .create(
          [
            {
              content: cont,
              languageId: 'javascript',
            },
          ],
          {
            title: message.author.tag,
            description: 'OwO',
          },
        )
        .then((json) => {
          return message.channel.send({
            embeds: [
              embed
                .setDescription(`Here's your link: ${json.url}`)
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                .setFooter('Thanks for using Toasty'),
            ],
          });
        })
        .catch((e) => {
          console.log(e);
          return message.channel.send({
            embeds: [
              embed
                .setDescription('An error occured! Try again')
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true })),
            ],
          });
        });
    }
  }

  async execSlash(interaction) {
    sourcebin
      .create([{ content: interaction.options[0]?.value, languageId: 'javascript' }], {
        title: interaction.member.user.tag,
        description: 'OwO',
      })
      .then((json) => {
        return interaction.reply("Here's your link: " + json.url, {
          ephemeral: true,
        });
      });
  }
};
