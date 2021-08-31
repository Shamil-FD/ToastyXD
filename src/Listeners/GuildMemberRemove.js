const { Listener } = require('discord-akairo');
const { userProfile } = require('../Util/Models');

module.exports = class GuildMemberRemoveListener extends Listener {
  constructor() {
    super('guildMemberRemove', {
      emitter: 'client',
      event: 'guildMemberRemove',
    });
  }

  async exec(member) {
    if (this.client.config.testMode === true) return;
    if (member.user.bot) return;
    
    let userProfileDoc = await userProfile.findOne({ user: member.id });
    if (!userProfileDoc) {
        return new userProfile({ user: member.id, timesLeft: 1 }).save();
    } else {
        userProfileDoc.timesLeft++;
        return userProfileDoc.save()
    }
  }
};
