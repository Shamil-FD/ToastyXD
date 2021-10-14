const { Listener } = require('@sapphire/framework');

module.exports = class GuildMemberRemoveListener extends Listener {
    constructor(context) {
        super(context, { 
            event: 'guildMemberRemove'
        })
    }
    async run(member) {
        if (this.container.client.config.testMode === true) return;
        if (member.user.bot) return;
    
        const userProfileDoc = await this.container.client.tools.models.userProfile.findOne({ user: member.id });
        if (!userProfileDoc) {
            return new this.container.client.tools.models.userProfile({ user: member.id, timesLeft: 1 }).save();
        } else {
            userProfileDoc.timesLeft++;
            return userProfileDoc.save()
        }
    }
}