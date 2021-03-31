const { MessageEmbed, Util } = require('discord.js');
const { randomBytes } = require('crypto');
const canvas = require('canvas');
canvas.registerFont(__dirname + '/Fonts/Ubuntu-Regular.ttf', {
	family: 'ubuntu',
});
canvas.registerFont(__dirname + '/Fonts/Ubuntu-BoldItalic.ttf', {
	family: 'ubuntuBold',
});

module.exports = {
	// Embed Function.
	embed: function () {
		return new MessageEmbed().setColor('#ffb600');
	},
	// Split Message Function
	split: async function (str) {
		str = await Util.splitMessage(str);
		return str;
	},

	// Captcha Function.
	captcha: async function () {
		function getRandom(n) {
			return Math.floor(Math.random() * (n - 60)) + 30;
		}
		// Random Letter Function.
		let characters = 6;
		const randomText = (length = characters) => {
			let chars = 'ABCDEFGHKLMNOPQRSTUVWXYZabcdefhikmnqrstuvwxy123456789';
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
		ctx.font = `40px ubuntu`;
		ctx.globalAlpha = 1;
		ctx.fillStyle = '#0e00e0';
		for (let n = 0; n < coordinates.length; n++) {
			ctx.fillText(word[n], coordinates[n][0], coordinates[n][1]);
		}

		// Buffer the Image
		let png = await canva.toBuffer();
		// Return the Result
		return { word, png };
	},
};
