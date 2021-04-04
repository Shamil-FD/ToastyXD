const Command = require('../../Util/Command.js');
const { MessageAttachment } = require("discord.js");
const canvas = require("canvas");
canvas.registerFont('Util/Fonts/Ubuntu-Regular.ttf', {
	family: 'ubuntu',
});

module.exports = class StaffinfoCommand extends Command {
	constructor() {
		super('staffinfo', {
			aliases: ['staffinfo', 'si'],
			category: 'Staff',
			channel: 'guild',
            cooldown: 15000,
        //    staffOnly: true,
            args: [{ id: "person", match: "content", default: (msg) => msg.author.id }]
		});
	}

	async exec(message, { person }) {
    
        person = await message.getMember(person);
		//if (!person.roles.cache.get(this.client.config.StaffRole))
			//return message.send({embeds: { description: `${person} don't seem to be a Staff.`, color: "RED" }});
        
        let doc = await this.client.models.staff.findOne({ user: person.id });
        if(!doc.infoCard){
            doc.infoCard.borders = "#070707";
            doc.infoCard.background = "#212121"
            await doc.save()
            doc = await this.client.models.Staff.findOne({ user: person.id });
        }
        
        let borderColor = doc.infoCard.borders;
        let backgroundColor = doc.infoCard.background;
        let bio = doc.desc ?? "Mysterious Person";
        
		let statusColor;
        // if (person.presence.status == "online") statusColor = "#3fff00";
        // else if (person.presence.status == "dnd") statusColor = "red";
        // else if (person.presence.status == "idle") statusColor = "orange";
        statusColor = "black";
        
        let canva = canvas.createCanvas(740, 360);
		const ctx = canva.getContext('2d');

        ctx.globalAlpha = 1;
		ctx.fillStyle = '#ffffff';
		ctx.beginPath();
		ctx.rect(0, 0, 740, 360);       
        ctx.save();
		ctx.lineJoin = 'miter';
		ctx.textBaseline = 'middle';

        ctx.fillStyle = doc.infoCard.background;       
        ctx.fillRect(0, 0, canva.width, canva.height);
        ctx.restore()
   
        ctx.beginPath()
        ctx.lineWidth = 20;     
		ctx.strokeStyle = doc.infoCard.borders;
        ctx.rect(0, 0, 740, 360);       
        ctx.stroke();		
                
        ctx.strokeStyle = doc.infoCard.borders;        
        ctx.lineWidth = 10;    
        ctx.beginPath();
        ctx.moveTo(230, 0);
        ctx.lineTo(230, 360);
        ctx.stroke();
        ctx.closePath();
        
       if(person.user.username.length >= 10){
        ctx.font = `25px ubuntu`;
        ctx.fillStyle = "white";
        ctx.textAlign = "start";
		ctx.fillText(person.user.username, 80, 270);
        
        
        ctx.strokeStyle = statusColor;        
        ctx.lineWidth = 5;    
        ctx.beginPath();
        ctx.moveTo(80, 280);
        ctx.lineTo(ctx.measureText(person.user.username).width + 80, 280);
        ctx.stroke();
        ctx.closePath();
        }else{
        ctx.font = `30px ubuntu`;
        ctx.fillStyle = "white";
        ctx.textAlign = "start";
		ctx.fillText(person.user.username, 70, 270);
        
        ctx.strokeStyle = statusColor;        
        ctx.lineWidth = 5;    
        ctx.beginPath();
        ctx.moveTo(70, 280);
        ctx.lineTo(ctx.measureText(person.user.username).width + 70, 280);
        ctx.stroke();
        ctx.closePath();
        }
        
        ctx.font = `30px ubuntu`;
        function TextLine(x, y, txt){
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ctx.measureText(txt).width + 250, y);
        ctx.stroke();
        ctx.closePath();
        }
       
        if(bio.length < 24){
        TextLine(250, 75, "Bio");
        ctx.fillText("Bio:", 250, 70);
        ctx.fillText(bio, 310, 70); 
        
        TextLine(250, 115, "Messages Today")
        ctx.fillText(`Messages Today: ${doc.msgs}`, 250, 110);    

        TextLine(250, 155, "Check-in for Today")        
        ctx.fillText(`Check-in for Today: ${doc.dailyCount}`, 250, 150);       
        
        TextLine(250, 200, "Total Messages")
        ctx.fillText(`Total Messages: ${doc.total}`, 250, 195);       
        
        TextLine(250, 240, "Strikes")
        ctx.fillText(`Strikes: ${doc.strikes ?? "0"}`, 250, 235);       
        }else{   
        ctx.fillText("Bio:", 250, 70);
        TextLine(250, 75, "Bio");
        let splittedBio = bio.lastIndexOf(" ")
        splittedBio = bio.substr(24).trim();
        ctx.fillText(bio.slice(0, 24) + "\n" + splittedBio, 310, 70); 
     	
        TextLine(250, 155, "Messages Today")         
        ctx.fillText(`Messages Today: ${doc.msgs}`, 250, 150);    
        
        TextLine(250, 200, "Check-in for Today")
        ctx.fillText(`Check-in for Today: ${doc.dailyCount}`, 250, 195);       
        
        TextLine(250, 240, "Total Messages")
        ctx.fillText(`Total Messages: ${doc.total}`, 250, 235);       
                   
        TextLine(250, 285, "Strikes")   
        ctx.fillText(`Strikes: ${doc.strikes ?? "0"}`, 250, 280);
        }
        
        ctx.beginPath();
		ctx.arc(120, 120, 90, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();
                
		const avatar = await canvas.loadImage(person.user.displayAvatarURL({ format: 'png' }));
      	ctx.drawImage(avatar, 25, 20, 200, 200);
        ctx.restore()        
        // ctx.beginPath();
        // ctx.arc(120, 120, 87, 0, Math.PI * 2);
        // ctx.strokeStyle = statusColor;
        // ctx.lineWidth = 5;
        // ctx.stroke();
        
   		const png = canva.toBuffer();
       
        return message.channel.send(new MessageAttachment(png, "staffinfo.png"))
    }
};
