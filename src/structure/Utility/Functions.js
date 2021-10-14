const { fillWithEmoji } = require('discord-emoji-canvas');
const { MessageEmbed, Util } = require('discord.js');
const canvas = require('canvas');
canvas.registerFont(__dirname + '/Fonts/JetBrains Mono Bold Nerd Font Complete.ttf', {
  family: 'jetbrains',
});
canvas.registerFont(__dirname + '/Fonts/Ubuntu-BoldItalic.ttf', {
  family: 'ubuntuBold',
});

module.exports = {
 
  embed: function () {
    return new MessageEmbed().setColor('BLURPLE');
  },
    
  randomNum: function (min, max) {
    return Math.floor((Math.random() * max) + min);
  },
    
  randomId: function (length) {
      let chars = '123456789987654321';
      let str = '';
      for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return str;    
  },
    
  captcha: async function () {
    function getRandom(n) {
      return Math.floor(Math.random() * (n - 60)) + 30;
    }
    // Random Letter Function.
    let characters = 6;
    const randomText = (chars, length = characters) => {
      chars = chars ?? '1234567890987654321';
      let str = '';
      for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return str;
    };

    // Initialize Canvas and Create the Background.
    let word = randomText();
    let randomNumbers = [];
    for (let i = 0; i < 5; i++) {
      randomNumbers.push(randomText(word));
    }
    let randomColor = Util.resolveColor('RANDOM');
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
    ctx.strokeStyle = '#' + randomColor.toString(16);
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

    let lineColor = '#' + Util.resolveColor('RANDOM').toString(16);
    // Draw the Strike Through Text Lines.
    coordinates = coordinates.sort((a, b) => a[0] - b[0]);
    ctx.strokeStyle = lineColor;
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
    return { word, png, randomNumbers, randomColor };
  },
    
  staffCard: async function(client, person) {
        let doc = await client.tools.models.staff.findOne({ user: person.id });
        let borderColor = doc.infoCard?.borders ?? '#070707';
        let backgroundColor = doc.infoCard?.background ?? '#212121';
        let textColor = doc.infoCard?.text ?? 'white';
        let backgroundImage = doc.infoCard.img || undefined;
        let bio = doc.infoCard?.desc ?? 'Mysterious Person';

        let statusColor;
        if (person?.presence?.status == 'online') statusColor = '#3ec185';
        else if (person?.presence?.status == 'dnd') statusColor = '#da4f4b';
        else if (person?.presence?.status == 'idle') statusColor = '#efa330';
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

        let arr = bio.split(' ');
        arr = await arr.filter(item => !item.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/)).join(' ')
        // Check if the bio is longer than 22 chars. If yes, add in a new line for the bio. If no, add in the bio
        if (arr.length < 24) {
        ctx.fillText(`${client.config.arrow} Bio:`, 250, 70);
        await fillWithEmoji(ctx, ` ${bio}`, 340, 70);

        ctx.fillText(`${client.config.arrow} Messages Today: ${doc.msgInfo?.today}`, 250, 105);

        ctx.fillText(`${client.config.arrow} Check-in for Today: ${doc.msgInfo?.dailyCount}`, 250, 145);

        ctx.fillText(`${client.config.arrow} Total Messages: ${doc.msgInfo?.total}`, 250, 185);

        ctx.fillText(`${client.config.arrow} Strikes: ${doc.strikes ?? '0'}`, 250, 225);

        ctx.fillText(
          `${client.config.arrow} Pronouns: ${
            person.roles.cache.has('863362112109805578')
              ? person.roles.cache.get('863362112109805578')?.name
              : person.roles.cache.has('863362112608534547')
              ? person.roles.cache.get('863362112608534547')?.name
              : person.roles.cache.has('863362113091272704')
              ? person.roles.cache.get('863362113091272704')?.name
              : person.roles.cache.has('863362113588953109')
              ? person.roles.cache.get('863362113588953109')?.name
              : person.roles.cache.has('863362114243395614')
              ? person.roles.cache.get('863362114243395614')?.name
              : 'n/a'
          }`,
          250,
          265,
        );
        } else {
        ctx.fillText(client.config.arrow + ' Bio:', 250, 70);
        await fillWithEmoji(ctx, ' ' + bio.slice(0, 25), 340, 70);
        await fillWithEmoji(ctx, ' ' + bio.replace(bio.slice(0, 25), ''), 340, 110);
        ctx.fillText(`${client.config.arrow} Messages Today: ${doc.msgInfo?.today}`, 250, 145);

        ctx.fillText(`${client.config.arrow} Check-in for Today: ${doc.msgInfo?.dailyCount}`, 250, 190);

        ctx.fillText(`${client.config.arrow} Total Messages: ${doc.msgInfo?.total}`, 250, 235);

        ctx.fillText(`${client.config.arrow} Strikes: ${doc.strikes ?? '0'}`, 250, 275);

        ctx.fillText(
          `${client.config.arrow} Pronouns: ${
            person.roles.cache.has('863362112109805578')
              ? person.roles.cache.get('863362112109805578')?.name
              : person.roles.cache.has('863362112608534547')
              ? person.roles.cache.get('863362112608534547')?.name
              : person.roles.cache.has('863362113091272704')
              ? person.roles.cache.get('863362113091272704')?.name
              : person.roles.cache.has('863362113588953109')
              ? person.roles.cache.get('863362113588953109')?.name
              : person.roles.cache.has('863362114243395614')
              ? person.roles.cache.get('863362114243395614')?.name
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
};
