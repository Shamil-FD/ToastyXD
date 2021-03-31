const { Listener } = require("discord-akairo");
const ms = require("pretty-ms");

module.exports = class CooldownListener extends Listener {
  constructor() {
    super("cooldown", {
      emitter: "commandHandler",
      event: "cooldown",
    });
  }

  exec(message, command, remaining) {
    let arr = [
      "Woah there! slow it",
      "stop, wait, do it again",
      "i appreciate it, buuuut you have to wait",
      "bUy pRemIuM t0 rEmOve cO0lDownS",
      "nah nah too fast",
      "mhm can ya slow it down",
      "SLOW IT MAN",
    ];
    return message.send(message.author, {
      embeds: {
        description: `Wait ${ms(remaining)} to use the command again`,
        title: arr[Math.round(Math.random() * arr.length)],
      },
    });
  }
};
