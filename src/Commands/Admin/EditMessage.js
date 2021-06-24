const Command = require('../../Struct/Command.js');

module.exports = class EditMessageCommand extends Command {
  constructor() {
    super('editmessage', {
      aliases: ['editmessage'],
      category: 'Admin',
      channel: 'guild',
      adminOnly: true,
      useSlashCommand: true,
      slashCommand: {
        description: 'Edit a message sent by me.',
        options: [
          {
            name: 'channel',
            description: 'The channel that the message is in.',
            type: 'CHANNEL',
            required: true,
          },
          {
            name: 'message-id',
            description: 'The ID of the message.',
            type: 'STRING',
            required: true,
          },
          {
            name: 'message-content',
            description: 'What the content of the message should be.',
            type: 'STRING',
          },
          {
            name: 'message-description',
            description: 'What the embed description should be.',
            type: 'STRING',
          },
          {
            name: 'message-title',
            description: 'What the embed title should be.',
            type: 'STRING',
          },
          {
            name: 'message-color',
            description: 'What the embed color should be. Hex codes only.',
            type: 'STRING',
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
    let channel = message.options.get('channel')?.channel;
    let msgid = message.options.get('message-id')?.value;
    let msgcontent = message.options.get('message-content')?.value;
    let msgdesc = message.options.get('message-description')?.value || undefined;
    let msgtitle = message.options.get('message-title')?.value || undefined;
    let msgcolor = message.options.get('message-color')?.value || undefined;
    let embed;

    message.defer(true);
    if (['category', 'voice'].includes(channel.type)) return message.reply("Don't try to break me because I will.");
    let gotmsg = await channel.messages.fetch(msgid);
    if (!gotmsg || gotmsg.author.id === this.client.user.id)
      return message.reply("That message either doesn't exist or it wasn't sent by me.");
    if (!msgcontent && !msgdesc && !msgtitle) return message.reply("I can't edit it to nothing.");

    if (msgdesc || msgtitle) {
      embed = this.client.tools.embed();
      msgdesc ? embed.setDescription(msgdesc) : null;
      msgtitle ? embed.setTitle(msgtitle) : null;
      msgcolor ? embed.setColor(msgcolor) : null;
    }

    try {
      await gotmsg.edit({
        content: msgcontent ? msgcontent : null,
        embeds: embed ? [embed] : null,
      });
      return message.editReply('Edited the message.');
    } catch (e) {
      console.error(e);
      return message.editReply(`There was an error!\n\`\`\`${e.stack}\`\`\``);
    }
  }
};
