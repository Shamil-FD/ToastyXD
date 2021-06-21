const { Flag } = require('discord-akairo');
const Command = require('../../../Struct/Command');

module.exports = class BlacklistCommand extends Command {
  constructor() {
    super('blacklist', {
      aliases: ['blacklist'],
      category: 'Staff',
      channel: 'guild',
      staffOnly: true,
      *args() {
        const method = yield {
          type: [
            ['blacklist-add', 'add'],
            ['blacklist-remove', 'remove'],
            ['blacklist-list', 'list'],
          ],

          otherwise: async (msg) => {
            msg = await msg.fetch();
            msg.reply({
              embeds: [
                this.client
                  .embed()
                  .setDescription(
                    `**To get the list of blacklisted words**\n${this.client.arrow} \`t)blacklist list\`\n**To add a word to the blacklist**\n${this.client.arrow} \`t)blacklist add [Action] [Word]\`\n**To add a word to the blacklist using a wildcard ( Will search through every word to find said word. Example: "grass" - it would find "ass")**\n${this.client.arrow} \`t)blacklist add wild [Action] [Word]\`\n**To remove a word from the blacklist**\n${this.client.arrow} \`t)blacklist remove [Word]\``,
                  )
                  .setAuthor(msg.author.username, msg.author.displayAvatarURL({ dynamic: true })),
              ],
            });
          },
        };
        return Flag.continue(method);
      },
    });
  }
};
