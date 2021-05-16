let { XMLHttpRequest } = require('xmlhttprequest');
const Command = require('../../Struct/Command.js');
const sourcebin = require('sourcebin');

module.exports = class PasteCodeCommand extends Command {
	constructor() {
		super('pastecode', {
			aliases: ['pastecode', 'pc'],
			category: 'misc',
			channel: 'guild',
			args: [
				{
					id: 'cont',
					match: 'content',
				},
			],
		});
	}

	async exec(message, { cont }) {
		let embed = this.client.embed();

		if (cont == '<code>' || cont == 'code') {
			return message.send(
				embed.setDescription(
					"Please replace '<code>'/'code' with your code to paste it in a bin OR send a file with t)pc in the message to paste it in a code bin."
				)
			);
		}
		if (message.attachments.first()) {
			let url = message.attachments.first().url;
			let txtFile = new XMLHttpRequest();

			txtFile.open('GET', url, true);

			txtFile.onreadystatechange = async function () {
				if (txtFile.readyState === 4) {
					if (txtFile.status === 200) {
						let allText = txtFile.responseText;

						sourcebin
							.create(
								[
									{
										content: allText,
										languageId: 'javascript',
									},
								],
								{
									title: message.author.tag,
									description: 'OwO',
								}
							)
							.then((json) => {
								return message.send(
									embed
										.setDescription(`Here's your link: ${json.url}`)
										.setAuthor(
											message.author.tag,
											message.author.displayAvatarURL({ dynamic: true })
										)
										.setFooter('Thanks for using Toasty')
								);
							})
							.catch((e) => {
								console.log(e);
								return message.send(
									embed
										.setDescription('An error occured! Try again')
										.setAuthor(
											message.author.tag,
											message.author.displayAvatarURL({ dynamic: true })
										)
								);
							});
					}
				}
			};
			txtFile.send(null);
		} else {
			if (!cont)
				return message.send(
					embed.setDescription(
						'You have to provide me either a code or a txt file with your code in it'
					)
				);
			sourcebin
				.create(
					[
						{
							content: cont,
							languageId: 'javascript',
						},
					],
					{
						title: message.author.tag,
						description: 'OwO',
					}
				)
				.then((json) => {
					return message.send(
						embed
							.setDescription(`Here's your link: ${json.url}`)
							.setAuthor(
								message.author.tag,
								message.author.displayAvatarURL({ dynamic: true })
							)
							.setFooter('Thanks for using Toasty')
					);
				})
				.catch((e) => {
					console.log(e);
					return message.send(
						embed
							.setDescription('An error occured! Try again')
							.setAuthor(
								message.author.tag,
								message.author.displayAvatarURL({ dynamic: true })
							)
					);
				});
		}
		message.deleted ? null : message.delete();
	}

	async execSlash(interaction) {
		sourcebin
			.create(
				[{ content: interaction.options[0].value, languageId: 'javascript' }],
				{ title: interaction.user.tag, description: 'OwO' }
			)
			.then((json) => {
				return interaction.reply("Here's your link: " + json.url, {
					ephemeral: true,
				});
			});
	}
};
