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
          if (value instanceof MessageEmbed || value.embeds) {
            if (value.embeds) {
              value = value.embeds;
            }
            if (!value.color) value.color = 'BLURPLE';
            if (value.description && value.description.length >= 2048) {
              const splitted = split(value.description);
              splitted.map((value) =>
                this.channel.send({
                  embeds: [value.setDescription(value)],
                  reply: { messageReference: this.id, failIfNotExists: true },
                }),
              );
            } else embed = value;
            if (!embed.color) embed.color = 'BLURPLE';
          } else {
            content = ' ';
            content += value;
          }
        });
        let data = {
          embeds: embed ? [embed] : null,
          reply: { messageReference: this.id, failIfNotExists: true },
        };
        if (content?.length) {
          data.content = content;
        }
        return this.channel.send(data);
      };
      this.getMember = async (content, guild) => {
        if (!content) return undefined;
        if (!guild) {
          guild = this.guild;
        } else {
          guild = await this.client.guilds.fetch(guild);
          guild = guild ?? this.guild;
        }
        return (
          this.mentions.members.first() ||
          (await guild.members.fetch(content)) ||
          (await guild.members.cache.find(
            (m) =>
              m.user.tag.toLowerCase() == content.toLowerCase() ||
              m.displayName.toLowerCase() == content.toLowerCase() ||
              m.user.username.toLowerCase() == content.toLowerCase(),
          )) ||
          undefined
        );
      };
      this.getRole = async (content, guild) => {
        if (!content) return undefined;
        if (!guild) {
          guild = this.guild;
        } else {
          guild = await this.client.guilds.fetch(guild);
          guild = guild ?? this.guild;
        }
        let role =
          (await guild.roles.cache.find((r) => r.name.toLowerCase() === content.toLowerCase())) ||
          guild.roles.fetch(content) ||
          this.mentions.roles.first();
        return role;
      };
      this.getChannel = async (content, guild) => {
        if (!guild) {
          guild = this.guild;
        } else {
          guild = await this.client.guilds.fetch(guild);
          guild = guild ?? this.guild;
        }
        let chnl =
          (await guild.channels.fetch(content)) ||
          guild.channels.cache.find((c) => c.name.toLowerCase() === content.toLowerCase()) ||
          this.mentions.channels.first();
      };
    }
  }
  return ToastyMessage;
});
