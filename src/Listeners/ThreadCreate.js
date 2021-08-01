const { MessageActionRow, MessageButton } = require('discord.js');
const { Listener } = require('discord-akairo');

module.exports = class ThreadCreateListener extends Listener {
  constructor() {
    super('threadCreate', {
      emitter: 'client',
      event: 'threadCreate',
    });
  }

  async exec(thread) {
    // Check if test mode is on
    if (this.client.config.testMode === true) return; 
    // Join Thread
    thread.join();   
    // Check if the channel is a help channel
    if (thread.parentId === '709043365727043588') {
        // Variables:
        let embed = this.client.tools.embed().setTitle('Help Thread').setDescription(`Welcome to your help thread!\n\nHere, please describe your issue and provide your code, if any.\nAlso please read these help rules:\n1. Do not ask/beg for source code. We don't give out source codes.\n\n2. Don't ping anyone for help without permission.\n\n3. Do not ask for help in DMs.\n\n4. When posting code/errors post them in a source code bin. Links can be found by running the command s!bins\n\n5. Be patient, people have a life outside of the internet.\n\n6. Don't ask to get help, if you have a question, post your question with code and errors.`);
        let button = new MessageActionRow().addComponents(new MessageButton().setLabel('Close').setStyle('DANGER').setCustomId(`archivethread${thread.id}`));
        let allThreads = await thread.guild.channels.fetchActiveThreads();
        allThreads = allThreads.threads.filter(aThread => aThread.parentId == '709043365727043588' && aThread.ownerId === thread.ownerId);
        
        // Check if the author has other active threads
        if (allThreads.size > 1) {
            await thread.delete();
            return thread.guild.members.cache.get(thread.ownerId).send({ embeds: [this.client.tools.embed().setDescription(`You already have a thread opened at <#${allThreads.filter(aThread => aThread.id !== thread.id).first().id}>!`).setTitle(`From: ${thread.guild.name}`)] }).catch(() => { return thread.guild.channels.cache.get('709043365727043588').send({ content: `<@${thread.ownerId}>,`, embeds: [this.client.tools.embed().setDescription(`You already have a thread opened at <#${allThreads.filter(aThread => aThread.id !== thread.id).first().id}>!`)] }) })
        }
        // Send the message to the thread
        let threadMsg = await thread.send({ content: `<@${thread.ownerId}> wants help, <@&${this.client.config.DevHelperRole}>,`, embeds: [embed], components: [button] });
        return threadMsg.pin()
    }
  }
};
