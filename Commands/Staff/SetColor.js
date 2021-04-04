const Command = require('../../Util/Command.js');
const { Util } = require("discord.js");

module.exports = class SetColorCommand extends Command {
	constructor() {
		super('setcolor', {
			aliases: ['setcolor'],
			category: 'Staff',
			channel: 'guild',
          //  staffOnly: true,
            args: [{ id: "border", match: "option", flag: "border" }, { id: "background" }]
		});
	}

	async exec(message, { border, background }) {
        let doc = await this.client.models.staff.findOne({ user: message.author.id });
        if(border){
            if(!doc.infoCard){
				doc.infoCard.borders = border;
                doc.infoCard.background = "#212121";
                await doc.save()
                doc = await this.client.models.staff.findOne({ user: message.author.id });
            }else{
                doc.infoCard.borders = border;
                await doc.save()
            }
            	return message.react(this.client.tick);
        }else if(background){
            if(!doc.infoCard){
				doc.infoCard.border = "#070707";
                doc.infoCard.background = background;
                await doc.save()
                doc = await this.client.models.staff.findOne({ user: message.author.id });
            }else{
                doc.infoCard.background = background;
                await doc.save()
            }
            	return message.react(this.client.tick)
        }else{
            	return message.send({embeds: { description: "Invalid command usage!\n```t)setcolor #ffffff```\n```t)setcolor border #000000```", color: "RED"}});
        }
    }
};
