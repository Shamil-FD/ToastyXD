const { MessageAttachment, Formatters } = require('discord.js');
const { Listener } = require('discord-akairo');
const moment = require('moment');

module.exports = class GuildMemberAddListener extends Listener {
  constructor() {
    super('guildMemberAdd', {
      emitter: 'client',
      event: 'guildMemberAdd',
    });
  }

  async exec(member) {
    if (this.client.config.testMode === true) return;
    if (member.user.bot) return;
    if (!member.guild.channels.cache.get('801877313855160340')) return;
    
    let userProfileDoc = await this.client.tools.models.userProfile.findOne({ user: member.id });
    if (!userProfileDoc) {
        await new this.client.tools.models.userProfile({ user: member.id, firstTime: true }).save()
    }
      
    // Verification Stuff
    let memberDate = moment(member.user.createdAt);
    let today = moment(Date.now());
    let num = today.diff(memberDate, 'days');

    // Change Their Nickname If It Doesn't Begin With An Alphabet
    if (!member.user.username.match(/^[0-9a-zA-Z]/g)) {
      await member.setNickname('Moderated Nickname');
    }
      
    // Add not verified role
    await member.roles.add(this.client.config.NotVerifiedRole);
    if (parseInt(num) < 7) {
      await member.send('Your account is too new to join our server.').catch((e) => {});
      await member.ban({ reason: 'Account age under 7 days.' });
      return member.guild.channels.cache.get(this.client.config.StaffReportChnl).send({
        embeds: [
          this.client.tools
            .embed()
            .setDescription(
              `${this.client.config.arrow} **User**: ${member.user.tag} | \`${member.id}\`\n${
                this.client.config.arrow
              } **Creation Date**: ${Formatters.time(member.user.createdAt, 'f')}\n${
                this.client.config.arrow
              } **Days Since Creation**: ${Formatters.time(new Date(member.user.createdAt), 'R')}\n${
                this.client.config.arrow
              } **Banned For**: Account age under 7 days.`,
            )
            .setTitle('Member Banned'),
        ],
      });
    }
    let sent = await member.guild.channels.cache
      .get('801877313855160340')
      .send({
        content: `<@${member.id}>,`,
        embeds: [this.client.tools.embed().setDescription('Read the pinned message to verify.')],
      });
    await member.guild.channels.cache.get(this.client.config.StaffReportChnl).send({
      embeds: [
        this.client.tools
          .embed()
          .setDescription(
            `${this.client.config.arrow} **User**: ${member.user.tag} | \`${member.id}\`\n${
              this.client.config.arrow
            } **Creation Date**: ${Formatters.time(member.user.createdAt, 'f')}\n${
              this.client.config.arrow
            } **Days Since Creation**: ${Formatters.time(new Date(member.user.createdAt), 'R')}\n${this.client.config.arrow} **Times Left The Server**: ${userProfileDoc?.timesLeft ?? '0'}`,
          )
          .setTitle('Member Joined'),
      ],
    });
    await this.client.tools.wait(require('ms')('5m'));
    return sent.delete().catch(() => {});
  }
};
