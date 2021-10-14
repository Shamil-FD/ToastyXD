const Command = require('../../structure/SlashCommand');

module.exports = class CreditsCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'credits',
        category: 'Information',
        description: 'Credits duh',
      });
    }

    run(message) {
        return message.reply({ embeds: [message.client.tools.embed().setDescription(`Thanks to these people for making me possible!\n\n» [Shamil](https://github.com/Shamil-FD) - Contributor\n» [Salvage_Dev](https://github.com/Milo123459) - Contributor\n» [FC5570](https://github.com/FC5570) - Contributor\n» [Shashank3736](https://github.com/Shashank3736) - For letting me use a piece of code from their [captcha-canvas](https://github.com/Shashank3736/captcha-canvas) project`)] });
    }
};