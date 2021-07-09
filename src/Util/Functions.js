const { MessageEmbed, Util } = require('discord.js');
const canvas = require('canvas');
canvas.registerFont(__dirname + '/Fonts/JetBrains Mono Bold Nerd Font Complete.ttf', {
  family: 'jetbrains',
});
canvas.registerFont(__dirname + '/Fonts/Ubuntu-BoldItalic.ttf', {
  family: 'ubuntuBold',
});

module.exports = {
  // Embed Function.
  embed: function () {
    return new MessageEmbed().setColor('BLURPLE');
  },
  rannum: function () {
    return Math.floor(Math.random() * 30 + 11) + 25;
  },
  // Split Message Function
  split: function (str) {
    return Util.splitMessage(str);
  },
  // Fetch Member
  getMember: async function ({ user, guild, message }) {
    if (guild) {
      if (parseInt(guild)) {
        guild = await message.client.guilds.fetch(guild);
      } else {
        guild = await message.client.guilds.cache.find((g) => g.name.toLowerCase() == guild.toLowerCase());
      }
    } else guild = message.guild;

    if (message.mentions.members.first()) {
      user = message.mentions.members.first();
    } else if (parseInt(user)) {
      user = await guild.members.fetch(user);
    } else if (typeof user === 'string') {
      user = await guild.members.cache.find(
        (m) =>
          m.user.tag.toLowerCase() == user.toLowerCase() ||
          m.displayName.toLowerCase() == user.toLowerCase() ||
          m.user.username.toLowerCase() == user.toLowerCase(),
      );
    }
    return user;
  },
  // Fetch Role
  getRole: async function ({ role, guild, message }) {
    if (guild) {
      if (parseInt(guild)) {
        guild = await message.client.guilds.fetch(guild);
      } else {
        guild = await message.client.guilds.cache.find((g) => g.name.toLowerCase() == guild.toLowerCase());
      }
    } else guild = message.guild;

    if (message.mentions.roles.first()) {
      role = message.mentions.roles.first();
    } else if (parseInt(role)) {
      role = await guild.roles.fetch(role);
    } else if (typeof role === 'string') {
      role = await guild.roles.cache.find((r) => r.name.toLowerCase() == r.toLowerCase());
    }
    return role;
  },
  // Fetch channel
  getChannel: async function ({ channel, guild, message }) {
    if (guild) {
      if (parseInt(guild)) {
        guild = await message.client.guilds.fetch(guild);
      } else {
        guild = await message.client.guilds.cache.find((g) => g.name.toLowerCase() == guild.toLowerCase());
      }
    } else guild = message.guild;

    if (message.mentions.channels.first()) {
      channel = message.mentions.channels.first();
    } else if (parseInt(channel)) {
      channel = await guild.channels.fetch(channel);
    } else if (typeof channel === 'string') {
      channel = await guild.channels.cache.find((c) => c.name.toLowerCase() == c.toLowerCase());
    }
    return channel;
  },

  // Captcha Function.
  captcha: async function () {
    function getRandom(n) {
      return Math.floor(Math.random() * (n - 60)) + 30;
    }
    // Random Letter Function.
    let characters = 6;
    const randomText = (length = characters) => {
      let chars = '1234567890987654321';
      let str = '';
      for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return str;
    };

    // Initialize Canvas and Create the Background.
    let word = randomText();
    let canva = canvas.createCanvas(600, 200);
    const ctx = canva.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.fillRect(0, 0, 600, 200);
    ctx.save();
    ctx.lineJoin = 'miter';
    ctx.textBaseline = 'middle';
    let coordinates = [];

    // Create the Borders.
    ctx.beginPath();
    ctx.rect(0, 0, 600, 200);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#d772e0';
    ctx.stroke();

    // Calculating the Letter Position Function.
    for (let i = 0; i < characters; i++) {
      const widthGap = Math.floor(600 / characters);
      let coordinate = [];
      let randomWidth = widthGap * (i + 0.2);
      coordinate.push(randomWidth);
      let randomHeight = getRandom(200);
      coordinate.push(randomHeight);
      coordinates.push(coordinate);
    }

    // Draw the Strike Through Text Lines.
    coordinates = coordinates.sort((a, b) => a[0] - b[0]);
    ctx.strokeStyle = '#6f64fc';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(coordinates[0][0], coordinates[0][1]);
    ctx.lineWidth = 5;
    for (let i = 1; i < coordinates.length; i++) {
      ctx.lineTo(coordinates[i][0], coordinates[i][1]);
    }
    ctx.stroke();

    // Fill in the Captcha Text.
    ctx.font = `40px jetbrains`;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#0e00e0';
    for (let n = 0; n < coordinates.length; n++) {
      ctx.fillText(word[n], coordinates[n][0], coordinates[n][1]);
    }

    // Buffer the Image
    const png = canva.toBuffer();
    // Return the Result
    return { word, png };
  },
};
