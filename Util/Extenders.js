const { Structures, Guild, MessageEmbed } = require("discord.js");
const { split } = require("../Util/Functions");

Structures.extend("Message", Message => {
  class ToastyMessage extends Message {
    constructor(client, data, channel) {
      super(client, data, channel);
      this.send = async (args, options = {}) => {
        let embed = undefined;

        if (options.embeds || args.embeds) {
          options.embeds = options.embeds ? options.embeds : args.embeds;
          embed = new MessageEmbed();
          options.embeds.title ? embed.setTitle(options.embeds.title) : null;
          options.embeds.footer ? embed.setFooter(options.embeds.footer) : null;
          options.embeds.color ? embed.setColor(options.embeds.color) : embed.setColor("#ffb600");
          options.embeds.author
            ? embed.setAuthor(
                options.embeds.author.text ? options.embeds.author.text : "",
                options.embeds.author.url ? options.embeds.author.url : null
              )
            : null;

          if (options.embeds.description.length > 2048) {
            let splitted = await split(options.embeds.description);
            if (splitted.length == 1) {
              return this.channel.send(args.embeds ? "" : args, embed.setDescription(splitted[0]));
            } else {
              for (let i = 0; i < splitted.length; i++) {
                this.channel.send(embed.setDescription(splitted[i]));
              }
              return this;
            }
          } else {
            options.embeds.description ? embed.setDescription(options.embeds.description) : null;
            return this.channel.send(args.embeds ? "" : args, embed);
          }
        } else {
          if (!args) return Promise.reject("No args provided");
          return this.channel.send(args);
        }
      };
      this.getMember = async content => {
        if (!content) return undefined;
        let member =
          this.guild.members.cache.find(m => m.user.tag.toLowerCase() === content.toLowerCase()) ||
          this.guild.members.cache.get(content) ||
          this.mentions.members.first();
        return member;
      };
      this.getRole = async content => {
        if (!content) return undefined;
        let role =
          (await this.guild.roles.cache.find(r => r.name.toLowerCase() === content.toLowerCase())) ||
          this.guild.roles.cache.get(content) ||
          this.mentions.roles.first();
        return role;
      };
    }
  }
  return ToastyMessage;
});

MessageEmbed.prototype.errorColor = function () {
  return this.setColor("RED");
};
MessageEmbed.prototype.successColor = function () {
  return this.setColor("GREEN");
};
