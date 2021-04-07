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
							if (!value.color) {
								if (this.author.id === '450212014912962560')
									value.setColor('YELLOW');
								else if (this.author.id === '606138051051126794')
									value.setColor('BLACK');
								else if (this.author.id === '423222193032396801')
									value.setColor('#000080');
								else if (this.author.id === '705843647287132200' || this.author.id === '520797108257816586')
									value.setColor('#add8e6');                                     
								else value.setColor('#ffb946');
							}
							splitted.map((value) =>
								this.channel.send(value.setDescription(value))
							);
						} else embed = value;
						if (!embed.color) {
							if (this.author.id === '450212014912962560')
								embed.color = 'YELLOW';
							else if (this.author.id === '606138051051126794')
								embed.color = 'BLACK';
							else if (this.author.id === '423222193032396801')
								embed.color = '#000080';
							else if (this.author.id === '705843647287132200' || this.author.id === '520797108257816586')
								embed.color = '#add8e6';
							else embed.color = '#ffb946';
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
