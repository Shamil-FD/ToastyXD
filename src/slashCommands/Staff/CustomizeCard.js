const Command = require('../../structure/SlashCommand');

module.exports = class CustomizeCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'customize',
        category: 'Staff',
        staffLevel: 1,
        description: 'Customize your staff info card!',  
        cooldownDelay: 5000,
        subCommands: ['color', 'bio'],
        options: [
            { name: 'bio', type: 'SUB_COMMAND', description: 'Change your bio.', options: [{ name: 'content', type: 'STRING', description: 'Content of the bio.', required: true }] },
            { name: 'color', type: 'SUB_COMMAND', description: 'Change the color of you staff info card. Colors should be either HMTL or HEX codes', options: [{ name: 'background', description: 'Background color', type: 'STRING' }, { name: 'borders', description: 'Border color', type: 'STRING' }, { name: 'text', description: 'Text color', type: 'STRING' }, { name: 'image', description: 'Like the background option but for **images**. URLs and Attachments only', type: 'STRING' }] }
        ]
      });
    }
   async runColor(message, options) {
       let doc = await message.client.tools.models.staff.findOne({ user: message.member.id });
       if (!doc) return message.reply({ 
           embeds: [message.client.tools.embed().setDescription('There was an error, please try again.')],
           ephemeral: true
       });
       if (message.options.size < 0)
       return message.reply({ 
           ephemeral: true,
           embeds: [message.client.tools.embed().setDescription('You have to choose at least one option.')]
       });

        // Variables:
       let border = message.options.get('borders')?.value;
       let bkg = message.options.get('background')?.value;
       let img = message.options.get('image')?.value;
       let text = message.options.get('text')?.value;

       if (border.toLowerCase() == 'transparent' || bkg.toLowerCase() == 'transparent' || text.toLowerCase() == 'transparent') 
           return message.reply({
               ephemeral: true,
               embeds: [message.client.tools.embed().setColor('RED').setDescription('You can\'t use \"transparent\" as a color.')]
           });
       if (border) doc.infoCard.borders = border
       if (bkg) doc.infoCard.background = bkg
       if (img) doc.infoCard.img = img
       if (text) doc.infoCard.text = text
       await doc.save();
       
       return message.reply({
           ephemeral: true,
           embeds: [message.client.tools.embed().setDescription(`Updated your card!\n\n${border ? `${message.client.config.arrow} Border: ${border}` : ''}\n${bkg ? `${message.client.config.arrow} Background: ${bkg}` : ''}\n${img ? `${message.client.config.arrow} Image: [Link](${img})` : ''}\n${text ? `${message.client.config.arrow} Text: ${text}` : ''}`)]
       })
   }
   async runBio(message, options) {
       let arr = options.get('content').value.split(' ');
       arr = await arr.filter(item => !item.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/)).join(' ')    
        if (arr.length > 49)
          return message.reply({
            embeds: [message.client.tools.embed().setDescription("You have to provide me a string that's no longer than 48 characters.").setColor('RED')],
            ephemeral: true,
          });

        let doc = await message.client.tools.models.staff.findOne({ user: message.member.id });
        doc.infoCard.desc = options.get('content').value;
        await doc.save();
        return message.reply({
          embeds: [message.client.tools.embed().setDescription('Successfully saved changes.')],
          ephemeral: true,
        });
   }
};
