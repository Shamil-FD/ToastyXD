const {
	AkairoClient,
	//	CommandHandler,
	InhibitorHandler,
	ListenerHandler,
} = require('discord-akairo');
const { Intents, Collection } = require('discord.js');
const { embed, captcha, split, rannum } = require(__dirname +
	'/Util/Functions');
const YouTubeNotifier = require('youtube-notification');
const Command = require(__dirname + '/Struct/Command');
const CommandHandler = require(__dirname + '/Struct/CommandHandler');
const models = require(__dirname + '/Util/Models');
const config = require(__dirname + '/Util/Config');
require(__dirname + '/Struct/Extenders');

class Toasty extends AkairoClient {
	constructor() {
		super(
			{
				ownerID: ['450212014912962560', '484031943021690883'],
			},
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
			}
		);
		this.commandHandler = new CommandHandler(this, {
			allowMention: true,
			prefix: 't)',
			classToHandle: Command,
			commandUtil: true,
			automateCategories: true,
			defaultCooldown: 5000,
			commandUtilLifetime: 300000,
			directory: __dirname + '/Commands/',
		});
		this.listenerHandler = new ListenerHandler(this, {
			directory: __dirname + '/Listeners/',
		});
		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: __dirname + '/Inhibitors/',
		});

		// Global Variables\
		this.config = config;
		this.tick = '✅';
		this.cross = '❌';
		this.arrow = '❯';
		this.split = split;
		this.embed = embed;
		this.captcha = captcha;
		this.models = models;
		this.rannum = rannum;
		const notifier = new YouTubeNotifier({
			hubCallback: 'https://jesus.only-fans.club/youtube',
			port: process.env.SERVER_PORT,
			secret: config.YoutubeSecret,
			path: '/youtube',
		});
		notifier.setup();
		notifier.subscribe('UC7-pjRSGoNEMoIujwOH2Mhw');
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler,
			youtube: notifier,
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

const client = new Toasty();
client.start();
