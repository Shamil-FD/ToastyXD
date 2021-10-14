const Command = require('../../structure/SlashCommand');
const arr = [
  'why cant i type in the help channel',
  'my code doesnt work',
  'my code does not work',
  'i cant send message to help chnl',
  'video didnt work',
  'code doesnt work',
  'code dont work',
  "i can't type in help",
  'help channel locked',
  'i cant type in help',
  'how to get access to help',
  'how to get help',
  "can't speak in help",
  'can someone help me',
  'i need help',
  'so i need help',
  'how do i get help',
];
module.exports = class HelpMeCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'helpme',
        description: 'Help?',
        category: 'Information',
        help: {
            usage: ['helpme', 'helpme <User>'],
            example: ['helpme', 'helpme @Shamil']
        },
        options: [{ name: 'user', description: 'Dumb person', type: 'USER' }]        
      });
    }

    async run(message, options) {
    let str = (await arr[Math.round(Math.random() * arr.length)]) ?? 'me need help pwease';
    let member = options.get('user')?.member    
  
    return message.reply({ content: member ? `<@${member.id}>,` : null, embeds: [message.client.tools.embed().setDescription("Uh oh, someone wants help..\n\nIf you do want help; you need to get to Level 1 on Arcane bot.\n> How do I get to Level 1?\n It's easy, just chat with people.\n> Can I spam?\n No, if you do, you are most likely not to get help.\n> I don't like this..\n Oh you don't? We don't care.").setTitle(str)] });
    }
};