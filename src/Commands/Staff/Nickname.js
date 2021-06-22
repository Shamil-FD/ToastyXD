const Command = require('../../Struct/Command.js');

module.exports = class NicknameCommand extends Command {
  constructor() {
    super('nickname', {
      aliases: ['nickname', 'nick'],
      category: 'Staff',
      channel: 'guild',
      staffOnly: true,
      slashCommand: true,
      description: {
        info: 'Change a user\'s nickname. Optional Stuff: `moderated` for "Moderated Nickname", `copy` for "CopyPaster", `dehoist` for "z I got dehoisted" OR anything else.',
        usage: ['t)nick User Options/Name'],
      },
      args: [
        { id: 'user' },
        {
          id: 'ops',
          type: (msg, phrase) => {
            if (!phrase) return null;
            let arr = ['moderated', 'mod', 'copy', 'copypaster', 'dehoist', 'hoist', 'reset'];
            if (arr.includes(phrase)) return phrase;
            return msg.util.parsed.content;
          },
        },
      ],
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

  async exec(message, { ops, user }) {
    let client = this.client;
    let stop = false;

    if (!ops)
      return message.send({
        embeds: {
          color: 'RED',
          description: 'Proper Usage: `t)nickname @User [mod | copy | reset | dehoist | Anything]`',
        },
      });
    ops = await ops.replace(user, '');
    ops = ops.trim();
    if (!user)
      return message.send({
        embeds: { description: 'Are you sure that you provided a user?' },
      });

    user = await message.getMember(user);
    if (!user)
      return message.send({
        embeds: { description: 'In-invalid u-uuserrr! err!' },
      });

    if (user.roles.cache.get(this.client.config.StaffRole))
      return message.send({
        embeds: {
          description: "Moderator changing a Moderator's nickname? That's a cap (whatever cap means)",
        },
      });

    let nick;
    if (ops == 'mod' || ops == 'moderated') nick = 'Moderated Nickname';
    else if (ops == 'copy' || ops == 'copypaster' || ops == 'paste') nick = 'Certified Copy-Paster';
    else if (ops == 'dehoist' || ops == 'hoist') nick = 'z I got Dehoisted';
    else if (ops == 'reset') nick = user.user.username;
    else nick = ops;
    // Change Nickname
    await user.setNickname(nick).catch(() => {
      stop = true;
      return message.send({
        embeds: { description: "I couldn't change their nickname, err!" },
      });
    });
    if (stop == true) return;
    return message.send({
      embeds: { description: `Changed ${user}'s nickname` },
    });
  }
  async execSlash(message) {
    if (!message.member.roles.cache.has(this.client.config.StaffRole))
      return message.reply({ content: "You can't use this command.", ephemeral: true });
    message.defer();

    if (!message.options.get('nickname')?.length && !message.options.get('premade')?.choices.length)
      return message.editReply({
        content: 'You have to provide me a valid option.',
        ephemeral: true,
      });

    if (!message.options.get('nickname').length) {
      if (message.options.get('premade')?.choices[0].name.toLowerCase() !== 'reset') {
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
        res = 'bad';
      }
      return res;
    }
  }
};
