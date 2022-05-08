const { staffCard, randomId, embed, captcha, randomNum } = require('./Utility/Functions');
const { SapphireClient } = require('@sapphire/framework');
const slashCommandStore = require('./SlashCommandStore');
const { Collection } = require('discord.js');
const models = require('./Utility/Models');
const mongoose = require('mongoose');

class ToastyXDClient extends SapphireClient {
    constructor(config = {}) {
        super({
            // Discord.JS Options
            presence: { activities: [{ name: 'Looking down on you', type: 'WATCHING' }] },
            partials: ['GUILD_MEMBER', 'REACTION', 'MESSAGE'],
            intents: 32767,
            allowedMentions: {
              parse: ['everyone', 'users', 'roles'],
              repliedUser: false,
            },
            // Sapphire Options
            defaultPrefix: config.prefix
        })
        this.config = config;
        this.config.lockdownMode = false;
        this.config.lockingMode = false;
        this.config.checkinUpdate = false;
        this.config.staffChecks = false
        this.tools = {            
            embed,
            captcha,
            models,
            randomNum,
            wait: require('util').promisify(setTimeout),
            randomId,
            staffCard
        };
        this.tags = new Collection();
        this.serverActivity = new Collection();
        this.blacklistedWords = [];
        this.botPrefixes = [];
        this.ignorePhrases = [];
        this.stores.register(new slashCommandStore());
    }
    async start(token, mongoURi) {
        await mongoose.connect(mongoURi, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        return super.login(token)
    }
}

module.exports = ToastyXDClient;
