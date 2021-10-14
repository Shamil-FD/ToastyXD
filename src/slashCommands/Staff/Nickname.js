const Command = require('../../structure/SlashCommand');

module.exports = class NicknameCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'nickname',
        category: 'Staff',
        staffLevel: 1,
        description: 'Change a user\'s nickname',  
        cooldownDelay: 5000,
        options: [
            { name: 'user', type: 'USER', description: 'The user', required: true },
            { name: 'nickname', type: 'STRING', description: 'New nickname' }, 
            { name: 'presets', type: 'STRING', description: 'Preset nicknames', choices: [{ name: 'moderated nickname', value: 'Moderated Nickname', }, { name: 'copy paster', value: 'Copy Paster' }, { name: 'dehoist', value: 'z Dehoisted' }, { name: 'reset', value: 'reset' }] }
        ]
      });
    }

    async run(message, options) {
        if (!options.get('nickname')?.value && !options.get('presets')?.value)
        return message.reply({
            content: 'You have to provide me a valid option.',
            ephemeral: true,
        });

        const nick = options.get('nickname')?.value;
        const preset = options.get('presets')?.value;
        const user = options.get('user')?.member;
        
        const changeNick = async (user, name) => {
            try {
                await user.setNickname(name);
                return true; 
            } catch (e) {
                console.log(e);
                return false;
            }
        };

        if (nick.length) {
            if (nick.length > 33) return message.editReply({ content: `Nickname's can't go longer than 32 characters.` });
            
            if (await changeNick(user, nick) === false) 
                return message.reply({
                    embeds: [message.client.tools.embed().setDescription(`I couldn't change <@${user.id}> nickname.`).setColor('RED')],
                    ephemeral: true
                });                        
            return message.reply({
                    embeds: [message.client.tools.embed().setDescription(`Changed <@${user.id}> nickname to ${nick}.`).setColor('GREEN')],
                    ephemeral: true                  
                });                
        } else {            
            if (preset === 'reset') {
                if (await changeNick(user, user?.user.username) === false)                     
                    return message.reply({
                        embeds: [message.client.tools.embed().setDescription(`I couldn't change <@${user.id}> nickname.`).setColor('RED')],
                        ephemeral: true
                    });                
            }
            if (await changeNick(user, preset) === false)                 
                return message.reply({
                    embeds: [message.client.tools.embed().setDescription(`I couldn't change <@${user.id}> nickname.`).setColor('RED')],
                    ephemeral: true
                });
        }
    }
};