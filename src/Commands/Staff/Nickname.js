const Command = require('../../Struct/Command.js');

module.exports = class NicknameCommand extends Command {
  constructor() {
    super('nickname', {
      aliases: ['nickname', 'nick'],
      category: 'Staff',
      channel: 'guild',
      staffOnly: true,
      useSlashCommand: true,
      description: {
        info: 'Change a user\'s nickname. Optional Stuff: `moderated` for "Moderated Nickname", `copy` for "CopyPaster", `dehoist` for "z I got dehoisted" OR anything else.',
        usage: ['/nickname User Options/Name'],
      },
      slashCommand: {
        description: "Change a user's nickname",
        options: [
          {
            name: 'user',
            description: 'The user that you want to change the nickname of.',
            type: 'USER',
            required: true,
          },
          {
            name: 'nickname',
            description: 'New nickname.',
            type: 'STRING',
            required: false,
          },
          {
            name: 'premade',
            description: 'Some premade nicknames.',
            type: 'STRING',
            choices: [
              {
                name: 'moderated nickname',
                value: 'Moderated Nickname',
              },
              {
                name: 'copy paster',
                value: 'Copy Paster',
              },
              {
                name: 'dehoist',
                value: 'z Dehoisted',
              },
              {
                name: 'reset',
                value: 'reset',
              },
            ],
          },
        ],
      },
    });
  }

  async exec(message) {
    return message.reply({
      embeds: [this.client.tools.embed().setDescription('This is disabled, use the slash command instead.')],
    });
  }
  async execSlash(message) {
    if (!message.member.roles.cache.has(this.client.config.StaffRole))
      return message.reply({ content: "You can't use this command.", ephemeral: true });
    await message.defer();

    if (!message.options.get('nickname')?.value.length && !message.options.get('premade')?.choices.length)
      return message.editReply({
        content: 'You have to provide me a valid option.',
        ephemeral: true,
      });

    if (!message.options.get('nickname').length) {
      if (message.options.get('premade')?.choices[0].name.toLowerCase() !== 'reset') {
        if (message.options.get('nickname').value.length > 33)
          return message.editReply("Nickname's can't be more than 32 characters.");
        let res = await change(message.options.get('user').member, message.options.get('nickname').value);
        if (res === 'bad') {
          return message.editReply(`I couldn't change ${message.options.get('user').member}'s nickname.`);
        } else {
          return message.editReply(`Changed their nickname to ${message.options.get('nickname').value}`);
        }
      } else {
        let res = await change(message.options.get('user').member, message.options.get('user').member.user?.username);
        if (res === 'bad') {
          return message.editReply(`I couldn't change ${message.options.get('user').member}'s nickname.`);
        } else {
          return message.editReply(`Changed their nickname to ${message.options.get('user').member}`);
        }
      }
    } else {
      let res = await change(message.options.get('user').member, message.options.get('premade')?.choices[0].value);
      if (res === 'bad') {
        return message.editReply(`I couldn't change ${message.options.get('user').member}'s nickname.`);
      } else {
        return message.editReply(`Changed their nickname to ${message.options.get('premade')?.choices[0].value}`);
      }
    }

    async function change(user, name) {
      let res;
      try {
        await user.setNickname(name);
        res = 'good';
      } catch (e) {
        console.log(e);
        res = 'bad';
      }
      return res;
    }
  }
};
