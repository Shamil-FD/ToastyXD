const { Listener } = require('discord-akairo');
const ms = require('pretty-ms');

module.exports = class CooldownListener extends Listener {
  constructor() {
    super('cooldown', {
      emitter: 'commandHandler',
      event: 'cooldown',
    });
  }

  async exec(message, command, remaining) {
    const arr = [
      'Woah there! slow it',
      'stop, wait, do it again',
      'i appreciate it, buuuut you have to wait',
      'bUy pRemIuM t0 rEmOve cO0lDownS',
      'nah nah too fast',
      'mhm can ya slow it down',
      'SLOW IT HOOman',
    ];
    let ads = [
      'https://cdn.discordapp.com/attachments/845362485707276298/859866680389795840/twitt.gif',
      'https://cdn.discordapp.com/attachments/845362485707276298/859866704209379348/sub.gif',
    ];
    let embed = this.client.tools
      .embed()
      .setDescription(
        `${command} doesn't want to be run right now. Wait ${ms(remaining, {
          verbose: true,
        })} to use the command again\nWhile you wait watch this ad..`,
      )
      .setTitle(await arr[Math.round(Math.random() * arr.length)])
      .setImage(await ads[Math.round(Math.random() * ads.length)]);
    let replied = await message.reply({ embeds: [embed] });
    await this.client.tools.wait(remaining);
    try {
      await message.delete();
      return replied.delete();
    } catch (e) {
      return;
    }
  }
};
