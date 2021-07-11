const Command = require('../../Struct/Command.js');
const { chnlmute } = require('../../Util/Models.js');

module.exports = class ChannelUnmuteCommand extends Command {
  constructor() {
    super('channelunmute', {
      aliases: ['channelunmute'],
      category: 'Staff',
      staffOnly: true,
      useSlashCommand: true,
      channel: 'guild',
      description: {
        info: 'Unmute a person who were muted in the current channel',
        usage: ['/channelunmute User Reason'],
      },
      slashCommand: {
        options: [
          {
            name: 'user',
            description: 'The user that is going to be unmuted.',
            type: 'USER',
            required: true,
          },
          {
            name: 'reason',
            description: 'The reason for the unmute.',
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
    let user = message.options.get('user')?.member;
    let reason = message.options.get('reason')?.value;
    await message.defer();

    let doc = await chnlmute.findOne({
      user: user?.id,
      chnl: message.channel.id,
    });
    if (!doc)
      return message.editReply({ embeds: [this.client.tools.embed().setDescription('They are already unmuted.')] });

    let hasError = false;
    await doc.delete();
    try {
      await message.channel.permissionOverwrites.get(user.id).delete();
    } catch (e) {
      hasError = true;
    }

    if (hasError === false) {
      message.editReply({
        embeds: [
          this.client.tools
            .embed()
            .setDescription(`Unmuted ${user} in this channel for ${reason}`)
            .setAuthor(message.member?.user?.username, message.member?.user?.displayAvatarURL({ dynamic: true })),
        ],
      });
    } else {
      message.editReply({
        embeds: [
          this.client.tools
            .embed()
            .setDescription(`${user} was already unmuted in this channel, but I deleted the document from my database.`)
            .setAuthor(message.member?.user?.username, message.member?.user?.displayAvatarURL({ dynamic: true })),
        ],
      });
    }

    return message.guild.channels.cache.get(this.client.config.StaffReportChnl).send({
      embeds: [
        this.client.tools
          .embed()
          .setTitle('User Unmuted')
          .setAuthor(
            `${this.client.config.arrow} Moderator: ${message.member?.user?.username}`,
            message.member?.user?.displayAvatarURL({ dynamic: true }),
          )
          .addField(this.client.config.arrow + ' **Victim**: ', `${user} || ${user?.id}`)
          .addField(this.client.config.arrow + ' **Reason**: ', reason)
          .addField(this.client.config.arrow + ' **Channel**: ', `<#${message.channel}>`),
      ],
    });
  }
};
