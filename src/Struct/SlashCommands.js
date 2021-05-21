const commandData = [
	{
		name: 'pastecode',
		description: 'Saves your code in a source bin.',
		options: [
			{
				name: 'code',
				type: 'STRING',
				description: 'The code.',
				required: true,
			},
		],
	},
	{
		name: 'staffinfo',
		description: "View staff's info.",
		options: [
			{
				name: 'user',
				type: 'USER',
				description: 'A Staff member',
				required: false,
			},
		],
	},
	{
		name: 'embed',
		description: 'Send an embed.',
		options: [
			{
				name: 'channel',
				type: 'CHANNEL',
				description: 'The channel you want the embed to be sent.',
				required: true,
			},
			{
				name: 'description',
				type: 'STRING',
				description: 'Description of the embed.',
				required: 'true',
			},
			{
				name: 'title',
				type: 'STRING',
				description: 'Title of the embed.',
				required: false,
			},
			{
				name: 'color',
				type: 'STRING',
				description: 'Color of the embed.',
				required: false,
			},
		],
	},
	{
		name: 'verbalwarn',
		description: 'Warn a user.',
		options: [
			{
				name: 'user',
				type: 'USER',
				required: true,
				description: 'The person who you are going to warn.',
			},
			{
				name: 'reason',
				type: 'STRING',
				required: true,
				description: 'Reasoning for the warning.',
			},
		],
	},
	{
		name: 'dictionary',
		description: 'Get a definition of a word.',
		options: [
			{
				name: 'normal',
				type: 'SUB_COMMAND',
				description: 'Get a definition of a word from your typical dictionary.',
				options: [
					{
						name: 'word',
						description: 'The word that you want the definition of.',
						type: 'STRING',
						required: true,
					},
				],
			},
			{
				name: 'urban',
				type: 'SUB_COMMAND',
				description: 'Get a definition of a word from the urban dictionary.',
				options: [
					{
						name: 'word',
						description: 'The word that you want the definition of.',
						type: 'STRING',
						required: true,
					},
				],
			},
		],
	},
	{
		name: 'stonks',
		description: "Put your or someone's pfp on the stonk meme.",
		options: [
			{
				name: 'user',
				description: 'A user.',
				type: 'USER',
				required: false,
			},
		],
	},
	{
		name: 'notstonks',
		description: "Put your or someone's pfp on the not stonk meme.",
		options: [
			{
				name: 'user',
				description: 'A user.',
				type: 'USER',
				required: false,
			},
		],
	},
	{
		name: 'meme',
		description: 'Programmer meme yay?',
	},
	{
		name: 'afk',
		description: 'Set your AFK status.',
		options: [
			{
				name: 'reason',
				type: 'STRING',
				description: 'The reason of this action.',
				required: false,
			},
			{
				name: 'mute',
				type: 'STRING',
				description:
					'Mute yourself for a specified time because why not? Ex: 11m',
				required: false,
			},
		],
	},
	{
		name: 'helpme',
		description: 'You want help?',
		options: [
			{
				name: 'user',
				type: 'USER',
				description: 'The user who needs help.',
				required: false,
			},
		],
	},
	{
		name: 'ping',
		description: 'Shows the ping and uptime of the bot.',
	},
	{
		name: 'setcolor',
		description: 'Set the color of your Staff info card.',
		options: [
			{
				name: 'background',
				type: 'STRING',
				description: 'The background color of the card.',
				required: false,
			},
			{
				name: 'borders',
				type: 'STRING',
				description: 'The border color of the card.',
				required: false,
			},
			{
				name: 'text',
				type: 'STRING',
				description: 'The text color of the card.',
				required: false,
			},
			{
				name: 'image',
				type: 'STRING',
				description:
					'The background image of the card ( Must be an image URL. ).',
				required: false,
			},
		],
	},
	{
		name: 'setbio',
		description: 'Set your bio in the Staff info card.',
		options: [
			{
				name: 'bio',
				description:
					'The bio you want to set as. Must not be longer than 48 characters.',
				required: true,
				type: 'STRING',
			},
		],
	},
	{
		name: 'removewarn',
		description: "Remove someone's warn.",
		options: [
			{
				name: 'caseid',
				description: 'The ID of the warn.',
				type: 'INTEGER',
				required: true,
			},
		],
	},
	{
		name: 'nickname',
		description:
			"Change someone's nickname using premade options or the typical way",
		options: [
			{
				name: 'user',
				description: 'The user that you want to change the nickname of.',
				type: 'USER',
				required: true,
			},
			{
				name: 'nickname',
				description: 'New nickname.',
				type: 'STRING',
				required: false,
			},
			{
				name: 'premade',
				description: 'Some premade nicknames.',
				type: 'STRING',
				choices: [
					{
						name: 'moderated nickname',
						value: 'Moderated Nickname',
					},
					{
						name: 'copy paster',
						value: 'Copy Paster',
					},
					{
						name: 'dehoist',
						value: 'z Dehoisted',
					},
					{
						name: 'reset',
						value: 'reset',
					},
				],
			},
		],
	},
	{
		name: 'move',
		description:
			'Off-topic conversation in a channel? Use this command to move them.',
		options: [
			{
				name: 'channel',
				type: 'CHANNEL',
				description: "The channel you're moving the conversation to.",
				required: true,
			},
		],
	},
	{
		name: 'clearwarns',
		description: "Clear someone's warns.",
		options: [
			{
				name: 'user',
				description: 'The user that you want to clear the warns of.',
				type: 'USER',
				required: true,
			},
		],
	},
	{
		name: 'channelmute',
		description: 'Mute someone in the current channel.',
		options: [
			{
				name: 'user',
				description: 'The user that is going to be muted.',
				type: 'USER',
				required: true,
			},
			{
				name: 'time',
				description: 'The time limit of the mute.',
				type: 'STRING',
				required: true,
			},
			{
				name: 'reason',
				description: 'The reason for the mute.',
				type: 'STRING',
				required: true,
			},
		],
	},
	{
		name: 'channelunmute',
		description: 'Unmute someone in the current channel.',
		options: [
			{
				name: 'user',
				description: 'The user that is going to be unmuted.',
				type: 'USER',
				required: true,
			},
			{
				name: 'reason',
				description: 'The reason for the unmute.',
				type: 'STRING',
				required: true,
			},
		],
	},
	{
		name: 'case',
		description: 'View info on a case.',
		options: [
			{
				name: 'id',
				description: 'The ID of the case.',
				type: 'INTEGER',
				required: true,
			},
		],
	},
	{
		name: 'leave',
		description: 'Going for a leave? Use me, please!',
		options: [
			{
				name: 'start',
				description: 'Start your leave by using me!!',
				type: 'SUB_COMMAND',
				options: [
					{
						name: 'start',
						description: 'The start date.',
						required: true,
						type: 'STRING',
					},
					{
						name: 'end',
						description: 'The end date.',
						required: true,
						type: 'STRING',
					},
					{
						name: 'reason',
						description: "Why you leaving us? I'm sad.",
						type: 'STRING',
						required: true,
					},
				],
			},
			{
				name: 'end',
				description: 'End your leave, yay!',
				type: 'SUB_COMMAND',
			},
		],
	},
	{
		name: 'help',
		description: 'Here, get some help.',
		options: [
			{
				name: 'command',
				description: 'Get info on a command, if there is info on it.',
				required: false,
				type: 'STRING',
			},
		],
	},
];

exports.slashCmds = commandData;
