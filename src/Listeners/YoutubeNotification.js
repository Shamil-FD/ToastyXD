const { Listener } = require('discord-akairo');

module.exports = class YoutubeListener extends Listener {
	constructor() {
		super('youtube', {
			emitter: 'youtube',
			event: 'notified',
		});
	}

	async exec(data) {
		let doc = this.client.models.youtube.findOne();
		let channel = this.client.channels.cache.get('738831830693707837');
		if (!doc) {
			await new this.client.models.youtube({ id: [data.video.id] }).save();
			if (channel)
				return channel.send(
					`Hey **${data.channel.name}** just uploaded a new video!!\n${data.video.link}`
				);
			else return;
		}

		doc.id.push(data.video.id);
		await doc.save();
		if (channel)
			return channel.send(
				`Hey **${data.channel.name}** just uploaded a new video!!\n${data.video.link}`
			);
		else return;
	}
};
