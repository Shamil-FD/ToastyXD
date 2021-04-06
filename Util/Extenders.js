const { Structures, MessageEmbed, User, GuildMember } = require('discord.js');
const { split } = require('../Util/Functions');

Structures.extend('Message', (Message) => {
	class ToastyMessage extends Message {
		constructor(client, data, channel) {
			super(client, data, channel);
			this.send = async (...args) => {
				let embed;
				let content;
				args.map(async (value) => {
					if (value instanceof User) {
						content = `${value.toString()},`;
					} else if (value instanceof MessageEmbed || value.embeds) {
						if (value.embeds) {
							value = value.embeds;
						}
						if (value.description && value.description.length >= 2048) {
							const splitted = await split(value.description);
							value.color
								? value.setColor(value.color)
								: value.setColor('#ffb946');
							splitted.map((value) =>
								this.channel.send(value.setDescription(value))
							);
						} else embed = value;
						if (!embed.color) {
							embed.color = '#ffb946';
						}
					} else {
						content = content || '';
						content += value;
					}
				});
				return this.channel.send({
					embed: embed ? embed : null,
					content: content,
				});
			};
			this.getMember = (content) => {
				if (!content) return undefined;
				return content instanceof GuildMember
					? content
					: content instanceof User
					? this.guild.member(content)
					: this.guild.members.cache.get(content) ||
					  this.mentions.members.first() ||
					  this.guild.members.cache.find(
							(m) =>
								m.user.tag.toLowerCase() == content.toLowerCase() ||
								m.displayName.toLowerCase().includes(content.toLowerCase()) ||
								m.user.username.toLowerCase().includes(content.toLowerCase())
					  );
			};
			this.getRole = (content) => {
				if (!content) return undefined;
				let role =
					this.guild.roles.cache.find(
						(r) => r.name.toLowerCase() === content.toLowerCase()
					) ||
					this.guild.roles.cache.get(content) ||
					this.mentions.roles.first();
				return role;
			};
		}
	}
	return ToastyMessage;
});

MessageEmbed.prototype.errorColor = function () {
	return this.setColor('RED');
};
MessageEmbed.prototype.successColor = function () {
	return this.setColor('GREEN');
};
