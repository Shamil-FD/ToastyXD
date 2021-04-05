const Command = require('../../Util/Command.js');
const { Util } = require('discord.js');

module.exports = class SetColorCommand extends Command {
	constructor() {
		super('setcolor', {
			aliases: ['setcolor'],
			category: 'Staff',
			channel: 'guild',
			staffOnly: true,
			args: [
				{ id: 'border', match: 'option', flag: 'borders' },
				{ id: 'text', match: 'option', flag: 'text' },
				{
					id: 'img',
					match: 'option',
					flag: 'img',
					default: (msg) =>
						msg.attachments.first() ? msg.attachments.first().url : null,
				},
				{ id: 'background' },
			],
		});
	}

	async exec(message, { img, text, border, background }) {
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
				embeds: { description: `Set ${text} as your text color.`, color: text },
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
					image: { url: img },
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
};
