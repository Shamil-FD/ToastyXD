const { Listener } = require('discord-akairo');
const ms = require('pretty-ms');

module.exports = class CooldownListener extends Listener {
  constructor() {
    super('cooldown', {
      emitter: 'commandHandler',
      event: 'cooldown',
    });
  }

  exec(message, command, remaining) {
    const arr = [
      'Woah there! slow it',
      'stop, wait, do it again',
      'i appreciate it, buuuut you have to wait',
      'bUy pRemIuM t0 rEmOve cO0lDownS',
      'nah nah too fast',
      'mhm can ya slow it down',
      'SLOW IT MAN',
    ];
    let embed = this.client
      .embed()
      .setDescription(
        `${command} doesn't want to be run right now. Wait ${ms(remaining, {
          verbose: true,
        })} to use the command again`,
      )
      .setTitle(arr[Math.round(Math.random() * arr.length)]);
    return message.reply({ embeds: [embed] });
  }
};
