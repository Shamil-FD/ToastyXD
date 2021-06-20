const Command = require('../../Struct/Command.js');
const {Util} = require('discord.js');

module.exports = class SetColorCommand extends Command {
	constructor() {
		super('setcolor', {
			aliases: ['setcolor'],
			category: 'Staff',
			channel: 'guild',
			description: {
				info: 'Set the background, text, border colors or set the background image of your Staff Info Card. Options: `borders`, `text`, `img`, `#Color` for background color',
				usage: [
					't)setcolor border #ff000f',
					't)setcolor text black',
					't)setcolor img ImageURL/ImageAttachment',
					't)setcolor #fffff',
				],
			},
			staffOnly: true,
			useSlashCommand: true,
			args: [
				{id: 'border', match: 'option', flag: 'borders'},
				{id: 'text', match: 'option', flag: 'text'},
				{
					id: 'img',
					match: 'option',
					flag: 'img',
					default: (msg) =>
						msg.attachments.first() ? msg.attachments.first().url : null,
				},
				{id: 'background'},
			],
			slashCommand: {
				description: 'Change the color of your staff info card',
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
		});
	}

	async exec(message, {img, text, border, background}) {
		let doc = await this.client.models.staff.findOne({
			user: message.author.id,
		});
		if (border) {
			if (!doc.infoCard) {
				doc.infoCard.borders = border;
				doc.infoCard.background = '#212121';
				doc.infoCard.img = 'none';
				doc.infoCard.text = 'white';
				await doc.save();
				doc = await this.client.models.staff.findOne({
					user: message.author.id,
				});
			} else {
				doc.infoCard.borders = border;
				await doc.save();
			}
			return message.send({
				embeds: {
					description: `Set ${border} as your border color.`,
					color: border,
				},
			});
		} else if (background) {
			if (!doc.infoCard) {
				doc.infoCard.border = '#070707';
				doc.infoCard.background = background;
				doc.infoCard.text = 'white';
				doc.infoCard.img = 'none';
				await doc.save();
				doc = await this.client.models.staff.findOne({
					user: message.author.id,
				});
			} else {
				doc.infoCard.background = background;
				doc.infoCard.img = 'none';
				await doc.save();
			}
			return message.send({
				embeds: {
					description: `Set ${background} as your background color.`,
					color: background,
				},
			});
		} else if (text) {
			if (!doc.infoCard) {
				doc.infoCard.border = '#070707';
				doc.infoCard.background = '#212121';
				doc.infoCard.img = 'none';
				doc.infoCard.text = text;
				await doc.save();
				doc = await this.client.models.staff.findOne({
					user: message.author.id,
				});
			} else {
				doc.infoCard.text = text;
				await doc.save();
			}
			return message.send({
				embeds: {description: `Set ${text} as your text color.`, color: text},
			});
		} else if (img) {
			if (!doc.infoCard) {
				doc.infoCard.border = '#070707';
				doc.infoCard.background = '#212121';
				doc.infoCard.img = img;
				doc.infoCard.text = 'white';
				await doc.save();
				doc = await this.client.models.staff.findOne({
					user: message.author.id,
				});
			} else {
				doc.infoCard.img = img;
				await doc.save();
			}
			return message.send({
				embeds: {
					description: `Set [this](${img}) as your background.`,
					color: 'GREEN',
					image: {url: img},
				},
			});
		} else {
			return message.send({
				embeds: {
					description:
						'Invalid command usage!\n```t)setcolor [#ffffff | blue]```\n```t)setcolor borders [#000000 | yellow]```\n```t)setcolor text [#ff00ff | white]```\n```t)setcolor img [ImageLink | ImageAttachment]```\nTip: You can use `auto` in the options: `text` and `borders` to set the colors similar to your presence color',
					color: 'RED',
				},
			});
		}
	}
	async execSlash(message) {
		if (!message.member.roles.cache.has(this.client.config.StaffRole))
			return message.reply("You can't use this command.", {ephemeral: true});
		message.defer();
		let doc = await this.client.models.staff.findOne({
			user: message.member.id,
		});
		if (!doc)
			return message.editReply('There was an error, please try again.', {
				ephemeral: true,
			});
		if (
			!message.options[0]?.value &&
			!message.options[1]?.value &&
			!message.options[2]?.value &&
			!message.options[3]?.value
		)
			return message.editReply('You have to choose at least one option.', {
				ephemeral: true,
			});

		doc.infoCard.borders = message.options[1]?.value || '#070707';
		doc.infoCard.background = message.options[0]?.value || '#212121';
		doc.infoCard.img = message.options[0]?.value
			? 'none'
			: message.options[3]?.value;
		doc.infoCard.text = message.options[2]?.value || 'white';
		await doc.save();
		return message.editReply('Successfully saved changes.', {
			ephemeral: true,
		});
	}
};
