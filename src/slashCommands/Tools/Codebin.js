const Command = require('../../structure/SlashCommand');
const { XMLHttpRequest } = require('xmlhttprequest');
const sourcebin = require('sourcebin');

module.exports = class CodebinCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'codebin',
        aliases: ['pc'],
        category: 'Tools',
        description: 'Paste your code to sourcebin!', 
        help: {
            usage: ['codebin <Code>', 'codebin <Txt File Attachment>'],            
        },
        options: [{ name: 'code', type: 'STRING', required: true, description: 'Code dummy' }]        
      });
    }

    async run(message, options) {
      /*if ((args.finished && !message?.attachments.first())) return message.reply({ embeds: [message.client.tools.embed().setDescription('You need to provide me some code or a txt file.').setColor('RED')] });*/
      
     // if (!message?.attachments.first()) {
          message.deferReply({ ephemeral: true })
          let content = await options.get('code').value;
          await sourcebin.create([{ content: content, languageId: 'javascript' }], { title: message.user.tag, description: '>_<' })
        .then(async (json) => {
          return message.reply({ embeds: [message.client.tools.embed().setDescription(`Here's your link: ${json.url}`).setAuthor(message.user.tag, message.user.displayAvatarURL({ dynamic: true }))] });
        })
        .catch((e) => {
          console.log(e);
          return message.reply({ embeds: [message.client.tools.embed().setDescription('An error occured! Try again').setAuthor(message.user.tag, message.user.displayAvatarURL({ dynamic: true }))] });
        })
      /*} else {        
      let url = message.attachments.first().url;
      let txtFile = new XMLHttpRequest();
      txtFile.open('GET', url, true);

      txtFile.onreadystatechange = async function () {
        if (txtFile.readyState === 4) {
          if (txtFile.status === 200) {
            let allText = txtFile.responseText;

            sourcebin.create([{ content: allText, languageId: 'javascript' }], { title: message.user.tag, description: '>_<' })
              .then(async (json) => {
                await message.reply({ embeds: [message.client.tools.embed().setDescription(`Here's your link: ${json.url}`).setAuthor(message.user.tag, message.user.displayAvatarURL({ dynamic: true }))]});
                return message.delete();
              })
              .catch((e) => {
                console.log(e);
                return message.channel.send({ embeds: [message.client.tools.embed().setDescription('An error occured! Try again').setAuthor(message.user.tag, message.user.displayAvatarURL({ dynamic: true }))] });
              });
          }
        }
      };
      txtFile.send(null);
        }*/
    }
};