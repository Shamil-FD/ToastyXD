const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const Command = require('../../structure/SlashCommand');
const { MessageAttachment, Util } = require('discord.js');

module.exports = class ServerActivityCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'serveractivity',
        category: 'Information',
        description: 'View the server\'s activity'       
      });
    }

    async run(message) {
        const doc = await message.client.tools.models.serverActivity.findOne();
        if (!doc) return message.reply({
            embeds: [message.client.tools.embed().setDescription('There is not enough data to show you the graph.')]
        });
        if (doc.messages?.length < 2) return message.reply({
            embeds: [message.client.tools.embed().setDescription('There is not enough data to show you the graph.')]                
        });
        
        const backgroundColour = 'white';
        const width = 800;
        const height = 600
        const chart = new ChartJSNodeCanvas({ width, height, backgroundColour })        
        const dates = [];
        const members = [];       
        const staff = [];
        const total = [];
        
        for (const stuff of doc.messages) {
            dates.push(stuff.date);
            members.push(stuff.count);
            staff.push(stuff.staff);
            total.push(stuff.total);
        }
        
        const img = await chart.renderToBuffer({
            type: 'bar',
            data: {                
                labels: dates,
                datasets: [{
                    label: 'Member Messages',
                    data: members,
                    backgroundColor: `#${Util.resolveColor('RANDOM').toString(16)}`,
                }, {
                    label: 'Total Messages',
                    data: total,
                    backgroundColor: `#${Util.resolveColor('RANDOM').toString(16)}`,                    
                }, {
                    label: 'Staff Messages',
                    data: staff,
                    backgroundColor: `#${Util.resolveColor('RANDOM').toString(16)}`,                    
                }],
            },
        })
        return message.reply({
            files: [new MessageAttachment(img)]
        })
    }
};
