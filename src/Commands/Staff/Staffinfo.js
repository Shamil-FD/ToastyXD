const Command = require('../../Struct/Command.js');
const { MessageAttachment } = require('discord.js');
const canvas = require('canvas');
canvas.registerFont('src/Util/Fonts/JetBrains Mono Bold Nerd Font Complete.ttf', {
  family: 'jetbrains',
});

module.exports = class StaffinfoCommand extends Command {
  constructor() {
    super('staffinfo', {
      aliases: ['staffinfo', 'si'],
      category: 'Staff',
      channel: 'guild',
      description: {
        info: 'Get info about a staff.',
        usage: ['t)staffinfo User'],
      },
      cooldown: 15000,
      staffOnly: true,
      useSlashCommand: true,
      args: [{ id: 'person', match: 'content', default: (msg) => msg.author.id }],
      slashCommand: {
        options: [
          {
            name: 'user',
            type: 'USER',
            description: 'A Staff member',
            required: false,
          },
        ],
      },
    });
  }

  async exec(message, { person }) {
    try {
      person = await message.getMember(person);
    } catch {}
    if (!person.id)
      return message.send({
        embeds: { description: `Couldn't find \`${person}\` 😔`, color: 'RED' },
      });
   if (!person.roles.cache.has(this.client.config.StaffRole))
      return message.send({
        embeds: {
          description: `${person} don't seem to be a Staff.`,
        },
     });

    return message.channel.send({
      files: [new MessageAttachment(await CanvasGen(this.client, person), 'staffinfo.png')],
    });
  }
  async execSlash(message) {
    let person = message.options[0]?.member || message.member;

    if (!message.member.roles.cache.has(this.client.config.StaffRole))
      return message.reply("You can't use this command.");
    if (!person.roles.cache.has(this.client.config.StaffRole)) return message.reply("They aren't a staff..");
    message.defer();

    message.editReply({
      files: [new MessageAttachment(await CanvasGen(this.client, person), 'staffinfo.png')],
      ephemeral: true,
    });
  }
};
async function CanvasGen(client, person) {
  let doc = await client.models.staff.findOne({ user: person.id });
  if (!doc.infoCard) {
    doc.infoCard.borders = '#070707';
    doc.infoCard.background = '#212121';
    doc.infoCard.text = 'black';
    doc.infoCard.img = 'none';
    await doc.save();
    doc = await client.models.staff.findOne({ user: person.id });
  }

  let borderColor = doc.infoCard?.borders;
  let backgroundColor = doc.infoCard?.background;
  let textColor = doc.infoCard?.text ?? 'white';
  let backgroundImage = doc.infoCard.img || undefined;
  let bio = doc.desc ?? 'Mysterious Person';

  let statusColor;
  if (person.presence.status == 'online') statusColor = '#3ec185';
  else if (person.presence.status == 'dnd') statusColor = '#da4f4b';
  else if (person.presence.status == 'idle') statusColor = '#efa330';
  else statusColor = '#7c8288';
  if (doc.infoCard.text?.toLowerCase() === 'auto') textColor = statusColor;
  if (doc.infoCard.borders?.toLowerCase() === 'auto') borderColor = statusColor;

  let canva = canvas.createCanvas(740, 360);
  const ctx = canva.getContext('2d');

  // Create the Rectangle
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(0, 0, 740, 360);
  ctx.save();
  ctx.lineJoin = 'miter';
  ctx.textBaseline = 'middle';

  // Add in the background image or the background color
  if (!backgroundImage || backgroundImage === 'none') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canva.width, canva.height);
  } else {
    backgroundImage = await canvas.loadImage(backgroundImage);
    ctx.drawImage(backgroundImage, 0, 0, canva.width, canva.height);
  }
  ctx.restore();

  // Add the borders
  ctx.beginPath();
  ctx.lineWidth = 20;
  ctx.strokeStyle = borderColor;
  ctx.rect(0, 0, 740, 360);
  ctx.stroke();

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(230, 0);
  ctx.lineTo(230, 360);
  ctx.stroke();
  ctx.closePath();

  // Check if the person's username is longer than 10 chars, if yes, resize the font and add the username. If no, add in the username
  if (person.user.username.length >= 10) {
    ctx.font = `21px jetbrains`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText(person.user.username, 125, 270);
  } else if (person.user.username.length > 15) {
    ctx.font = `10px jetbrains`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText(person.user.username, 120, 270);
  } else {
    ctx.font = `25px jetbrains`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText(person.user.username, 120, 270);
  }

  ctx.textAlign = 'start';
  ctx.font = `25px jetbrains`;

  // Check if the bio is longer than 22 chars. If yes, add in a new line for the bio. If no, add in the bio
  if (bio.length < 21) {
    ctx.fillText(`${client.arrow} Bio:`, 250, 70);
    ctx.fillText(` ${bio}`, 340, 70);

    ctx.fillText(`${client.arrow} Messages Today: ${doc.msgs}`, 250, 105);

    ctx.fillText(`${client.arrow} Check-in for Today: ${doc.dailyCount}`, 250, 145);

    ctx.fillText(`${client.arrow} Total Messages: ${doc.total}`, 250, 185);

    ctx.fillText(`${client.arrow} Strikes: ${doc.strikes ?? '0'}`, 250, 225);

    ctx.fillText(
      `${client.arrow} Pronouns: ${
        person.roles.cache.has('853560859677425674')
          ? 'he/him'
          : person.roles.cache.has('853560886605119528')
          ? 'she/her'
          : person.roles.cache.has('853560908630720573')
          ? 'they/them'
          : person.roles.cache.has('853560940922404895')
          ? 'other'
          : 'n/a'
      }`,
      250,
      265,
    );
  } else {
    ctx.fillText(client.arrow + ' Bio:', 250, 70);
    let splittedBio = bio.lastIndexOf(' ');
    splittedBio = bio.substr(24).trim();
    ctx.fillText(' ' + bio.slice(0, 24) + '\n' + splittedBio, 340, 70);

    ctx.fillText(`${client.arrow} Messages Today: ${doc.msgs}`, 250, 145);

    ctx.fillText(`${client.arrow} Check-in for Today: ${doc.dailyCount}`, 250, 190);

    ctx.fillText(`${client.arrow} Total Messages: ${doc.total}`, 250, 235);

    ctx.fillText(`${client.arrow} Strikes: ${doc.strikes ?? '0'}`, 250, 275);

    ctx.fillText(
      `${client.arrow} Pronouns: ${
        person.roles.cache.has('853560859677425674')
          ? 'he/him'
          : person.roles.cache.has('853560886605119528')
          ? 'she/her'
          : person.roles.cache.has('853560908630720573')
          ? 'they/them'
          : person.roles.cache.has('853560940922404895')
          ? 'other'
          : 'n/a'
      }`,
      250,
      315,
    );
  }

  // Add in the status circle part 1
  ctx.beginPath();
  ctx.fillStyle = statusColor;
  ctx.arc(175, 193, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
  ctx.save();

  // Create a circle for the avatar
  ctx.beginPath();
  ctx.arc(120, 120, 95, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  // Add in the avatar
  const avatar = await canvas.loadImage(person.user.displayAvatarURL({ format: 'png' }));
  ctx.drawImage(avatar, 27, 30, 185, 185);
  ctx.restore();

  // Add in the border around the avatar
  ctx.beginPath();
  ctx.arc(120, 120, 93, 0, Math.PI * 2);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Add in the status circle part 2
  ctx.beginPath();
  ctx.fillStyle = statusColor;
  ctx.arc(175, 193, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  // Buffer and send
  return canva.toBuffer();
}
