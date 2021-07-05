const { AkairoClient, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const { embed, captcha, split, rannum, getRole, getMember, getChannel } = require('../Util/Functions');
const { Intents, Collection } = require('discord.js');
const CommandHandler = require('./CommandHandler');
const models = require('../Util/Models');
const Command = require('./Command');
const path = require('path');

module.exports = class ToastyClient extends AkairoClient {
  constructor(config = {}) {
    super(
      { ownerID: ['450212014912962560', '484031943021690883'] },
      {
        presence: {
          status: 'online',
          activities: [
            {
              name: 'being more beautiful than you',
              type: 'COMPETING',
            },
          ],
        },
        partials: ['GUILD_MEMBER', 'REACTION', 'MESSAGE'],
        intents: Intents.ALL,
        allowedMentions: {
          parse: ['everyone', 'users', 'roles'],
          repliedUser: false,
        },
      },
    );

    this.commandHandler = new CommandHandler(this, {
      allowMention: true,
      prefix: config.prefix,
      classToHandle: Command,
      commandUtil: true,
      automateCategories: true,
      defaultCooldown: 5000,
      commandUtilLifetime: 300000,
      ignoreCooldown: [],
      directory: `${path.dirname(require?.main?.filename)}${path.sep}Commands/`,
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: `${path.dirname(require?.main?.filename)}${path.sep}Listeners/`,
    });

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: `${path.dirname(require?.main?.filename)}${path.sep}Inhibitors/`,
    });

    // Global Variables
    this.config = config;
    this.tools = {
      embed: embed,
      captcha: captcha,
      models: models,
      rannum: rannum,
      split: split,
      wait: require('util').promisify(setTimeout),
      getRole: getRole,
      getMember: getMember,
      getChannel: getChannel,
    };

    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler,
    });

    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.inhibitorHandler.loadAll();
    this.commandHandler.loadAll();
    this.listenerHandler.loadAll();
  }

  async start({ Token }) {
    await super.login(Token);
  }
};
