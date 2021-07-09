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
    await message.defer(true);

    if (!message.options.get('nickname')?.value && !message.options.get('premade')?.value)
      return message.editReply({
        content: 'You have to provide me a valid option.',
        ephemeral: true,
      });

    let nick = await message.options.get('nickname')?.value;
    let premade = await message.options.get('premade')?.value;
    let user = await message.options.get('user')?.member;
    let change = async (user, name) => {
      let res;
      try {
        await user.setNickname(name);
        res = 'good';
      } catch (e) {
        console.log(e);
        res = 'bad';
      }
      return res;
    };

    if (nick) {
      if (nick.length > 33) return message.editReply({ content: `Nickname's can't go longer than 32 characters.` });
      let changed = await change(user, nick);

      if (changed === 'good') return message.editReply({ content: `Changed ${user}'s nickname to \`${nick}\`` });
      else
        return message.editReply({
          content: `There was an error! This could be because of your role is higher than mine.`,
        });
    } else if (premade) {
      if (premade === 'reset') {
        let changed = await change(user, user?.user.username);
        if (changed === 'good') return message.editReply({ content: `Successfully reset ${user}'s nickname.` });
        else
          return message.editReply({
            content: `There was an error! This could be because of your role is higher than mine.`,
          });
      } else {
        let changed = await change(user, premade);
        if (changed === 'good') return message.editReply({ content: `Changed ${user}'s nickname to ${premade}.` });
        else
          return message.editReply({
            content: `There was an error! This could be because of your role is higher than mine.`,
          });
      }
    } else return message.editReply({ content: `You have to provide one of the options!` });
  }
};
