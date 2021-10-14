const { MessageAttachment, Formatters } = require('discord.js');
const { Listener } = require('@sapphire/framework');
const moment = require('moment');

module.exports = class GuildMemberAddListener extends Listener {
    constructor(context) {
        super(context, { 
            event: 'guildMemberAdd'
        })
    }    
    async run(member) {        
        if (this.container.client.config.testMode === true) return;
    	if (member.user.bot) return;
        if (!member.guild.channels.cache.get('801877313855160340')) return;
    
    	const userProfileDoc = await this.container.client.tools.models.userProfile.findOne({ user: member.id });
        if (!userProfileDoc) {
            await new this.container.client.tools.models.userProfile({ user: member.id, firstTime: true }).save()
        }
      
        // Verification Stuff
        const memberDate = moment(member.user.createdAt);
        const today = moment(Date.now());
        let days = today.diff(memberDate, 'days');

        // Change Their Nickname If It Doesn't Begin With An Alphabet
        if (!member.user.username.match(/^[0-9a-zA-Z]/g)) {
          await member.setNickname('Moderated Nickname');
        }
      
        // Add not verified role
        await member.roles.add(this.container.client.config.notVerifiedRole);
        if (days < 7) {
            if (days <= 0) days = 2;
            await member.send('Your account is too new to join our server.').catch((e) => {});
            await member.ban({ days: (days - 1), reason: 'Account age under 7 days.' });
            return member.guild.channels.cache.get(this.container.client.config.staffReportChnl).send({
            embeds: [this.container.client.tools.embed().setDescription(
              `${this.container.client.config.arrow} **User**: ${member.user.tag} | \`${member.id}\`\n${
                this.container.client.config.arrow
              } **Account Creation Date**: ${Formatters.time(new Date(member.user.createdAt), 'R')}\n${
                this.container.client.config.arrow
              } **Banned For**: Account age under 7 days.`,
            )
            .setTitle('Member Banned'),
            ],
          });
        }
        
        const sent = await member.guild.channels.cache.get('801877313855160340').send({            
            content: `<@${member.id}>,`,
            embeds: [this.container.client.tools.embed().setDescription('Read the pinned message to verify.')],
          });
        
        await member.guild.channels.cache.get(this.container.client.config.staffReportChnl).send({            
            embeds: [this.container.client.tools.embed()
          .setDescription(
            `${this.container.client.config.arrow} **User**: ${member.user.tag} | \`${member.id}\`\n${
              this.container.client.config.arrow
            } **Account Creation Date**: ${Formatters.time(new Date(member.user.createdAt), 'R')}\n${this.container.client.config.arrow} **Times Left The Server**: ${userProfileDoc?.timesLeft ?? '0'}`,
          )
          .setTitle('Member Joined'),
          ],
        });
        await this.container.client.tools.wait(require('ms')('5m'));
        return sent.delete().catch((e) => { console.log(e) });
    }
}