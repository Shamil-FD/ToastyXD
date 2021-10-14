const { MessageButton, MessageActionRow } = require('discord.js');
const Command = require('../../structure/SlashCommand');

module.exports = class AppealCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'appeal',
        description: 'Appeal for your ban', 
        category: 'Appeal',
        appealServerOnly: true,
        help: {
            usage: ['appeal']
        }
      });
    }

    async run(message, options) {
        await message.reply({ embeds: [message.client.tools.embed().setDescription('Please wait while I check for your ban record..')] });
        
        let guild = await message.client.guilds.cache.get('655109296400367618');
        let bannedInfo = await guild.bans.fetch(message.user.id).catch(() => { return undefined; });
        if (!bannedInfo) return message.editReply({ embeds: [message.client.tools.embed().setDescription("You aren't banned in Salvage Squad.")] });

        let category = await message.guild.channels.cache.get('823128094051008515');
        let children = category.children;
        children = await children.filter((c) => c.topic.includes(message.user.id));
        if (children.size) return message.editReply({ embeds: [message.client.tools.embed().setDescription(`You already have a appeal channel opened at <#${children.id}>.`)] });

        let channel = await message.guild.channels.create(message.user.username, {
          topic: `User: ${message.user.id}`,
          parent: category,
          permissionOverwrites: [
            { id: message.guild.id, deny: ['VIEW_CHANNEL'] },
            { id: message.user.id, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'] },
            { id: '823124026623918082', allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
          ],
        });
        let button = new MessageActionRow().addComponents([
          new MessageButton().setCustomId('appealclose').setLabel('Close').setStyle('PRIMARY'),
        ]);

        let m = await channel.send({ embeds: [message.client.tools.embed().setDescription(`${message.member} wants to appeal for a ban.\n${bannedInfo?.reason ? `Banned Reason: \`${bannedInfo?.reason}\`\n\nTo appealer:\n1. Why should we unban you?\n2. How long has it been since you've got banned?` : "To appealer:\n1. Why were you banned?\n2. Why should be unban you?\n3. How long has it been since you've got banned?"}`)], components: [button] });
        await m.pin();
        return message.editReply({ embeds: [message.client.tools.embed().setDescription(`Please appeal at <#${channel.id}>`)] })
    }
}