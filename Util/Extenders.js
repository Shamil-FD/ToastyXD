const { Structures, MessageEmbed, User } = require('discord.js');
const { split } = require('../Util/Functions');

Structures.extend('Message', (Message) => {
	class ToastyMessage extends Message {
		constructor(client, data, channel) {
			super(client, data, channel);
			this.send = async (...args) => {
                let embed;
                let content;
                args.map((value) => {
                    if (value instanceof User) {
                        content += `${value.toString()},`;
                    } else if(value instanceof MessageEmbed || value.embeds) {
                        if(value.embeds) {
                            value = value.embeds;
                        }
                        if(value.description.length >= 2048) {
                            const splitted = split(value.description.length);
                            splitted.map((value) => super.channel.send(value.setDescription(value)));
                        } else embed = value;
                    } else {
                        content += value;
                    }
                });
                super.channel.send({
                    embeds: embed ? [embed] : [],
                    content: content
                })
			};
			this.getMember = async (content) => {
				if (!content) return undefined;
				let member =
					this.guild.members.cache.find(
						(m) => m.user.tag.toLowerCase() === content.toLowerCase()
					) ||
					this.guild.members.cache.get(content) ||
					this.mentions.members.first();
				return member;
			};
			this.getRole = async (content) => {
				if (!content) return undefined;
				let role =
					(await this.guild.roles.cache.find(
						(r) => r.name.toLowerCase() === content.toLowerCase()
					)) ||
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
