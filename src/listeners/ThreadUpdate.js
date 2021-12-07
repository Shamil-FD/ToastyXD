const { Listener } = require('@sapphire/framework');

module.exports = class ThreadUpdateListener extends Listener {
    constructor(context) {
        super(context, { 
            event: 'threadUpdate'
        })
    }
  async run(Old, New) {
      if (Old.archived === New.archived) return;
      if (New.archived === true) return;
      
      await New.setArchived(false);
      await New.send({ embeds: [New.client.tools.embed().setDescription('This thread has been archived.').setColor('RED').setTitle('Archived')] });
      await New.setArchived(true);      
  }
}