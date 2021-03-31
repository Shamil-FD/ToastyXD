const Command = require("../../Util/Command.js");

module.exports = class StaffInfoCommand extends Command {
  constructor() {
    super("staffInfo", {
      aliases: ["staffinfo", "si"],
      category: "Staff",
      channel: "guild",
      staffOnly: true,
      args: [{ id: "person", match: "rest", default: msg => msg.member.id }],
    });
  }

  async exec(message, { person }) {
    let client = this.client;
    let { staff } = client.models;
    let { arrow } = client;
    let embed = client.embed();

    person = await message.getMember(person);
    if (!person.roles.cache.get(this.client.config.StaffRole))
      return message.send(embed.setDescription(`Come back when ${person} is a staff`));

    let doc = await staff.findOne({ user: person.id });
    if (!doc)
      return message.send(message.author, {
        embeds: {
          description: "You didn't have a document saved in my database, please try again.",
          color: "RED",
        },
      });

    let perms = [];
    if (person.roles.cache.find(r => r.name.toLowerCase() === "moderator")) perms.push("Moderator");
    if (person.roles.cache.find(r => r.name.toLowerCase() === "trial moderator")) perms.push("Trial Moderator");
    if (person.roles.cache.find(r => r.name.toLowerCase() === "senior moderator")) perms.push("Senior Moderator");
    if (person.roles.cache.find(r => r.name.toLowerCase() === "Admin")) perms.push("Admin");
    if (person.roles.cache.find(r => r.name.toLowerCase() === "senior admin")) perms.push("Senior Admin");
    if (person.roles.cache.find(r => r.name.toLowerCase() === "community manager")) perms.push("Community Manager");
    if (person.roles.cache.find(r => r.name.toLowerCase() === "staff managers")) perms.push("Staff Manager");
    if (person.roles.cache.find(r => r.name.toLowerCase() === "salvage")) perms.push('Some guy who "owns" the server');

    return message.send(
      embed
        .setAuthor(person.user.username, person.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `${arrow} **Bio**: ${doc.desc ? doc.desc : "I love Toasty XD so much!"}\n${arrow} **Messages Sent Today**: ${
            doc.msgs
          }\n${arrow} **Total Message Count**: ${doc.total}\n${arrow} **Today's Check-In Count**: ${
            doc.dailyCount
          }\n${arrow} **Strike Count**: ${
            doc.strikes ? doc.strikes : "0"
          }\n${arrow} **Staff Position(s)**: ${perms.join(", ")}`
        )
    );
  }
};
