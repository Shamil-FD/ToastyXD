const { Command, CommandOptions } = require("discord-akairo");

module.exports = class MyModule extends Command {
  constructor(id, CommandOptions, managerOnly, staffOnly, beta) {
    super(id, CommandOptions);
    this.staffOnly = CommandOptions.staffOnly || false;
    this.managerOnly = CommandOptions.managerOnly || false;
    this.beta = CommandOptions.beta || false;
  }

  exec() {
    throw new Error("Not implemented!");
  }
};
