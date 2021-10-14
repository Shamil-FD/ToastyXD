const { Listener } = require('@sapphire/framework');

module.exports = class CommandBlockedListener extends Listener {
    constructor(context) {
        super(context, { 
            event: 'commandBlocked'
        })
    }
  async run(message, content) {
    return message.reply({ ephemeral: true, embeds: [this.container.client.tools.embed().setDescription(content)] });
  }
}