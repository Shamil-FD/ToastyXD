const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler, ClientUtil } = require("discord-akairo");
const { MessageEmbed, Intents, Collection } = require("discord.js");
const { embed, captcha, split } = require("./Util/Functions");
const { black, greenBright } = require("chalk");
const Command = require("./Util/Command");
const models = require("./Util/Models");
const config = require("./Util/Config");
const mongoose = require("mongoose");
require("./Util/Extenders.js");
require("dotenv");

class MyClient extends AkairoClient {
  constructor() {
    super(
      {
        ownerID: "484031943021690883",
      },
      {
        presence: {
          status: "dnd",
          activity: {
            name: "Goodbye",
            type: "WATCHING",
          },
        },
        partials: ["GUILD_MEMBER", "REACTION", "MESSAGE"],
        ws: {
          intents: [Intents.ALL],
        },
      }
    );
    this.commandHandler = new CommandHandler(this, {
      allowMention: true,
      prefix: "t)",
      classToHandle: Command,
      commandUtil: true,
      automateCategories: true,
      defaultCooldown: 5000,
      commandUtilLifetime: 300000,
      directory: "./Commands/",
    });
    this.listenerHandler = new ListenerHandler(this, {
      directory: "./Listeners/",
    });
    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: "./Inhibitors/",
    });

    // Global Variables\
    this.config = config;
    this.firstTime = new Collection();
    this.tick = "✅";
    this.cross = "❌";
    this.arrow = "❯";
    this.split = split;
    this.embed = embed;
    this.captcha = captcha;
    this.models = models;
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

  async start() {
    await super.login(config.Token);
  }
}

const client = new MyClient();

client.start();
mongoose
  .connect(config.Mongo, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(console.log(black.bgGreen("[MongoDB]") + greenBright(" DataBase Connected.")));
