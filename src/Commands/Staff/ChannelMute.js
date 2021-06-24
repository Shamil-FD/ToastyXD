const Command = require('../../Struct/Command.js');
const { chnlmute } = require('../../Util/Models.js');
const pretty = require('pretty-ms');
const moment = require('moment');
const ms = require('ms');

module.exports = class ChannelMuteCommand extends Command {
  constructor() {
    super('channelmute', {
      aliases: ['channelmute', 'cm'],
      category: 'Staff',
      channel: 'guild',
      staffOnly: true,
      useSlashCommand: true,
      description: {
        info: 'Mute a user in the current channel.',
        usage: ['t)channelmute User Time Reason'],
      },
      args: [{ id: 'user', type: 'memberMention' }, { id: 'time' }, { id: 'reason', match: 'rest' }],
      slashCommand: {
        options: [
          {
            name: 'user',
            description: 'The user that is going to be muted.',
            type: 'USER',
            required: true,
          },
          {
            name: 'time',
            description: 'The time limit of the mute.',
            type: 'STRING',
            required: true,
          },
          {
            name: 'reason',
            description: 'The reason for the mute.',
            type: 'STRING',
            required: true,
          },
        ],
      },
    });
  }

  async exec(message, { user, time, reason }) {
    let client = this.client;

    if (!user)
      return message.send(
        client.tools.embed().setDescription('Proper usage: `t)channelmute @User [5m | 5h | 5d] [reason]`'),
      );

    if (!time)
      return message.send(
        client.tools.embed().setDescription('Proper usage: `t)channelmute @User [5m | 5h | 5d] [reason]`'),
      );
    if (!reason) return message.send(client.tools.embed().setDescription('No reason = No mute dum dum'));

    let doc = await chnlmute.findOne({
      user: user.id,
      chnl: message.channel.id,
    });
    if (doc) return message.send(client.tools.embed().setDescription('They are already muted'));

    time = ms(time);
    if (!time)
      return message.send(
        client.tools.embed().setDescription('Proper usage: `t)channelmute @User [5m | 5h | 5d] [reason]`'),
      );

    await new chnlmute({
      user: user.id,
      chnl: message.channel.id,
      time: time,
      date: Date.now(),
      reason: reason,
      mod: message.author.tag,
    }).save();
    await message.channel.createOverwrite(user, {
      SEND_MESSAGES: false,
      ADD_REACTIONS: false,
    });

    message.send(
      client.tools
        .embed()
        .setDescription(
          `${this.client.config.arrow} Muted ${user} in this channel for ${pretty(time)}\nReason: ${reason}`,
        )
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true })),
    );

    message.guild.channels.cache.get(this.client.config.StaffReportChnl).send({
      embeds: [
        client.tools
          .embed()
          .setTitle('Muted')
          .setAuthor(
            `${this.client.config.arrow} Moderator: ${message.author.username}`,
            message.author.displayAvatarURL({ dynamic: true }),
          )
          .addField(this.client.config.arrow + ' **Victim**:', `${user} || ${user.id}`, true)
          .addField(this.client.config.arrow + ' **Reason**:', reason, true)
          .addField(this.client.config.arrow + ' **Duration**:', pretty(time), true)
          .addField(this.client.config.arrow + '**Channel**:', message.channel, true)
          .addField(this.client.config.arrow + '**Date**:', moment().format('DD/MM/YY')),
      ],
    });
  }
  async execSlash(message) {
    if (!message.member?.roles.cache.has(this.client.config.StaffRole))
      return message.reply({ content: "You can't use this command.", ephemeral: true });
    let time = ms(message.options.get('time').value);
    let reason = message.options.get('reason').value;
    let member = message.options.get('user').member;

    if (!time)
      return message.reply({
        content: 'You provided an invalid time.',
        ephemeral: true,
      });
    message.defer();

    let doc = await chnlmute.findOne({
      user: member?.id,
      chnl: message.channel.id,
    });
    if (doc) return message.editReply('They are already muted.');

    await new chnlmute({
      user: member?.id,
      chnl: message.channel.id,
      time: time,
      date: Date.now(),
      reason: reason,
      mod: message.member?.user?.tag,
    }).save();
    await message.channel.createOverwrite(member, {
      SEND_MESSAGES: false,
      ADD_REACTIONS: false,
    });

    await message.editReply({
      embeds: [
        this.client.tools
          .embed()
          .setDescription(`Muted ${member} in this channel for \`${pretty(time)}\`, reasoning \`${reason}\``),
      ],
    });
    return message.guild.channels.cache.get(this.client.config.StaffReportChnl).send({
      embeds: [
        this.client.tools
          .embed()
          .setTitle('Muted')
          .setAuthor(
            `${this.client.arrow} Moderator: ${message.member?.user?.username}`,
            message.member?.user?.displayAvatarURL({ dynamic: true }),
          )
          .addField(this.client.config.arrow + ' **Victim**:', `${member} || ${member?.id}`, true)
          .addField(this.client.config.arrow + ' **Reason**:', reason, true)
          .addField(this.client.config.arrow + ' **Duration**:', pretty(time), true)
          .addField(this.client.config.arrow + '**Channel**:', message.channel, true)
          .addField(this.client.config.arrow + '**Date**:', moment().format('DD/MM/YY')),
      ],
    });
  }
};
