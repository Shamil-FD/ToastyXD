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
        usage: ['/channelmute User Time Reason'],
      },
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

  async exec(message) {
    return message.reply({
      embeds: [this.client.tools.embed().setDescription('This is disabled, use the slash command instead.')],
    });
  }
  async execSlash(message) {
    let time = ms(message.options.get('time')?.value);
    let reason = message.options.get('reason')?.value;
    let member = message.options.get('user')?.member;

    if (!time)
      return message.reply({
        content: 'You provided an invalid time.',
        ephemeral: true,
      });
    await message.defer();

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
          .addField(this.client.config.arrow + ' **Victim**:', `${member} || ${member?.id}`)
          .addField(this.client.config.arrow + ' **Reason**:', reason)
          .addField(this.client.config.arrow + ' **Duration**:', await pretty(time))
          .addField(this.client.config.arrow + '**Channel**:', `<#${message.channel.id}>`)
          .addField(this.client.config.arrow + '**Date**:', await moment().format('DD/MM/YY')),
      ],
    });
  }
};
