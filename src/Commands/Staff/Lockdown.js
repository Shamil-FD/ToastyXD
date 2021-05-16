const Command = require('../../Struct/Command.js');
const { pos } = require('../../Util/Models');

module.exports = class LockDownCommand extends Command {
	constructor() {
		super('lockdown', {
			aliases: ['lockdown'],
			category: 'Staff',
			channel: 'guild',
			cooldown: 15000,
			description: {
				info:
					'Lockdown the server. USE THIS CAREFULLY. USE THIS COMMAND TO LOCK AND UNLOCK THE SERVER',
				usage: ['t)lockdown'],
			},
			staffOnly: true,
		});
	}

	async exec(message) {
		let channels = message.guild.channels;
		let doc = await pos.findOne();
		let level10 = message.guild.roles.cache.get('751033299220299806');
		let level3 = message.guild.roles.cache.get('813428341050441759');
		let level1 = message.guild.roles.cache.get('751032945648730142');
		let level5 = message.guild.roles.cache.get('751033133180125284');
		let booster = message.guild.roles.cache.get('703874626916188171');

		if (!doc) {
			await new pos({ pos: true }).save();

			let msg = await message.send(
				this.client
					.embed()
					.setDescription(
						'Locking the server.. Please wait until this message gets edited..'
					)
			);

			await channels.cache
				.get('709043328682950716')
				.createOverwrite(message.guild.id, { SEND_MESSAGES: false })
				.then(async () => {
					await channels.cache
						.get('709043831995105360')
						.createOverwrite(message.guild.id, { SEND_MESSAGES: false })
						.then(async () => {
							await channels.cache
								.get('790254009235013663')
								.createOverwrite(level3, { SEND_MESSAGES: false })
								.then(async () => {
									await channels.cache
										.get('709160883607044126')
										.createOverwrite(level3, {
											SEND_MESSAGES: false,
											READ_MESSAGE_HISTORY: true,
										})
										.then(async () => {
											await channels.cache
												.get('752983993720504340')
												.createOverwrite(message.guild.id, {
													SEND_MESSAGES: false,
												})
												.then(async () => {
													await channels.cache
														.get('752983872068780204')
														.createOverwrite(message.guild.id, {
															SEND_MESSAGES: false,
														})
														.then(async () => {
															await channels.cache
																.get('781221115271970826')
																.createOverwrite(level10, {
																	SEND_MESSAGES: false,
																})
																.then(async () => {
																	await channels.cache
																		.get('768536934120816680')
																		.createOverwrite(level10, {
																			SEND_MESSAGES: false,
																		})
																		.then(async () => {
																			await channels.cache
																				.get('709043683235987567')
																				.createOverwrite(booster, {
																					SEND_MESSAGES: false,
																				})
																				.then(async () => {
																					await channels.cache
																						.get('762965783575265280')
																						.createOverwrite(booster, {
																							SEND_MESSAGES: false,
																						})
																						.then(async () => {
																							await channels.cache
																								.get('709043414053814303')
																								.createOverwrite(level1, {
																									SEND_MESSAGES: false,
																								})
																								.then(async () => {
																									await channels.cache
																										.get('709043365727043588')
																										.createOverwrite(level1, {
																											SEND_MESSAGES: false,
																										})
																										.then(async () => {
																											await channels.cache
																												.get(
																													'709043365727043588'
																												)
																												.createOverwrite(
																													level5,
																													{
																														SEND_MESSAGES: false,
																													}
																												)
																												.then(async () => {
																													await channels.cache
																														.get(
																															'709043414053814303'
																														)
																														.createOverwrite(
																															level5,
																															{
																																SEND_MESSAGES: false,
																															}
																														)
																														.then(async () => {
																															return msg.edit(
																																this.client
																																	.embed()
																																	.setDescription(
																																		'Locked the whole server.'
																																	)
																																	.setColor(
																																		'GREEN'
																																	)
																															);
																														});
																												});
																										});
																								});
																						});
																				});
																		});
																});
														});
												});
										});
								});
						});
				});
		} else {
			if (doc.pos === true) {
				let msg = await message.send(
					this.client
						.embed()
						.setDescription(
							'Unlocking the server.. Please wait until this message gets edited...'
						)
				);
				await doc.delete();
				await channels.cache
					.get('709043328682950716')
					.createOverwrite(message.guild.id, { SEND_MESSAGES: true })
					.then(async () => {
						await channels.cache
							.get('709043831995105360')
							.createOverwrite(message.guild.id, { SEND_MESSAGES: true })
							.then(async () => {
								await channels.cache
									.get('790254009235013663')
									.createOverwrite(level3, { SEND_MESSAGES: true })
									.then(async () => {
										await channels.cache
											.get('709160883607044126')
											.createOverwrite(level3, {
												SEND_MESSAGES: true,
												READ_MESSAGE_HISTORY: true,
											})
											.then(async () => {
												await channels.cache
													.get('752983993720504340')
													.createOverwrite(message.guild.id, {
														SEND_MESSAGES: true,
													})
													.then(async () => {
														await channels.cache
															.get('752983872068780204')
															.createOverwrite(message.guild.id, {
																SEND_MESSAGES: true,
															})
															.then(async () => {
																await channels.cache
																	.get('781221115271970826')
																	.createOverwrite(level10, {
																		SEND_MESSAGES: true,
																		VIEW_CHANNEL: true,
																	})
																	.then(async () => {
																		await channels.cache
																			.get('768536934120816680')
																			.createOverwrite(level10, {
																				SEND_MESSAGES: true,
																			})
																			.then(async () => {
																				await channels.cache
																					.get('709043683235987567')
																					.createOverwrite(booster, {
																						SEND_MESSAGES: true,
																						VIEW_CHANNEL: true,
																					})
																					.then(async () => {
																						await channels.cache
																							.get('762965783575265280')
																							.createOverwrite(booster, {
																								SEND_MESSAGES: true,
																							})
																							.then(async () => {
																								await channels.cache
																									.get('709043414053814303')
																									.createOverwrite(level1, {
																										SEND_MESSAGES: true,
																									})
																									.then(async () => {
																										await channels.cache
																											.get('709043365727043588')
																											.createOverwrite(level1, {
																												SEND_MESSAGES: true,
																											})
																											.then(async () => {
																												await channels.cache
																													.get(
																														'709043365727043588'
																													)
																													.createOverwrite(
																														level5,
																														{
																															SEND_MESSAGES: true,
																														}
																													)
																													.then(async () => {
																														await channels.cache
																															.get(
																																'709043414053814303'
																															)
																															.createOverwrite(
																																level5,
																																{
																																	SEND_MESSAGES: true,
																																}
																															)
																															.then(
																																async () => {
																																	return msg.edit(
																																		this.client
																																			.embed()
																																			.setDescription(
																																				'Unlocked the whole server.'
																																			)
																																			.setColor(
																																				'GREEN'
																																			)
																																	);
																																}
																															);
																													});
																											});
																									});
																							});
																					});
																			});
																	});
															});
													});
											});
									});
							});
					});
			}
		}
	}
};
