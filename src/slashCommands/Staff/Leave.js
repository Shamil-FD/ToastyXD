const { MessageActionRow, MessageButton } = require('discord.js');
const Command = require('../../structure/SlashCommand');
const moment = require('moment');
const _ = require('lodash');

module.exports = class LeaveCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'leave',
        category: 'Staff',
        staffLevel: 1,
        description: 'Take a leave, have a leave',  
        cooldownDelay: 15000,
        subCommands: ['begin', 'end', 'list'],
        options: [            
            {                
                name: 'begin', description: 'Start your leave by using me!!',
                type: 'SUB_COMMAND', options: [
                    {                       
                        name: 'start', description: 'Start date. Use \'today\' for today\'s date or number of days. Format DD/MM/YYYY OR DD/MM/YY',
                        required: true, type: 'STRING',
                    },
                    {
                        name: 'end', description: "End date or 'indefinite' for no end date or number of days. Format DD/MM/YYYY OR DD/MM/YY",
                        required: true, type: 'STRING',
                    },
                    {
                        name: 'reason', description: "Why you leaving us?",
                        type: 'STRING', required: true,
                    },
                ],
            },
            {
                name: 'end', description: 'End your leave',
                type: 'SUB_COMMAND',
            },
            {
                name: 'list', description: 'List your current and future leave notices',
                type: 'SUB_COMMAND'
            }
        ]
      });
    }
    async runList(message, options) {
        const { leave } = message.client.tools.models;
        const docs = await leave.find({ user: message.member?.id });        
        const fields = [];
        
        if (!docs.length) return message.reply({
            ephemeral: true,
            embeds: [message.client.tools.embed().setDescription('You\'ve got no scheduled/current leave notices.').setColor('RED')]
        });
        
        docs.forEach(doc => {
            fields.push({ name: `${moment(new Date(doc.start)).format('DD/MM/YYYY')} - ${moment(new Date(doc.end)).format('DD/MM/YYYY')}`, value: _.truncate(doc.reason, { 'length': 1020, 'omission': '...'}) })
        });
        
        return message.reply({
            ephemeral: true,
            embeds: [message.client.tools.embed().addFields(fields).setFooter('Times are formated as DD/MM/YYYY')]
        })
    }
    async runEnd(message, options) {
        const { leave, staff } = message.client.tools.models;        
        const docs = await leave.find({ user: message.member?.id });
        const list = []; 
        const button1 = [];
        let fields = [];
        let button2;
        
        await message.deferReply({ ephemeral: true });
        if (!docs.length) return message.editReply({ 
                embeds: [message.client.tools.embed().setDescription("Ding dong, you don't have any scheduled notices you slong.")],
                ephemeral: true
            });
        
        for (let i = 0; i < docs.length; i++) {
            list.push({ index: i + 1, doc: docs[i] });
            button1.push(new MessageButton().setStyle('PRIMARY').setLabel((i + 1).toString()).setCustomId((i + 1).toString()))          
            fields.push({ name: `**__${i + 1}__**. ${moment(new Date(docs[i].start)).format('DD/MM/YYYY')} - ${moment(new Date(docs[i].end)).format('DD/MM/YYYY')}`, value: _.truncate(docs[i].reason, { 'length': 1020, 'omission': '...'}) })
        }                    
        fields.push({ name: 'Last Action', value: 'No actions.' });
        
        if (button1.length > 5) {
            button2 = button1.splice(0, 4)
        }
        
        await message.editReply({ 
            embeds: [message.client.tools.embed().setFields(fields)],
            components: [new MessageActionRow().addComponents(button1, Array.isArray(button2) ? button2 : [])],
            ephemeral: true
        });
        
        const filter = i => i.user.id === message.user.id;    
        const collector = message.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 30000 });
        
        collector.on('collect', async (clicked) => {
            await collector.resetTimer({ time: 3000 })
            
            let item = list.find(items => items.index == parseInt(clicked.customId))
            await item.doc.delete();
            if ((moment().to(moment(item.doc.start))).includes('ago')) {
                let staffDoc = await staff.findOne({ user: message.member?.id });
                staffDoc.onLeave = false;
                await staffDoc.save();
            }
            
            if (item.index > 5) {
                button2[(item.index - 1)].setDisabled(true)
            } else {
                button1[(item.index - 1)].setDisabled(true)
            }
            
            fields.find(field => field.name === 'Last Action').value = `Deleted a notice: ${moment(item.doc.start).format('DD/MM/YY')} - ${moment(item.doc.end).format('DD/MM/YY')}`;
            fields = fields.filter(field => field.name !== `**__${item.index}__**. ${moment(new Date(item.doc.start)).format('DD/MM/YYYY')} - ${moment(new Date(item.doc.end)).format('DD/MM/YYYY')}`);
            
            await message.editReply({ 
                embeds: [message.client.tools.embed().setFields(fields)],
                components: [new MessageActionRow().addComponents(button1, Array.isArray(button2) ? button2 : [])],
                ephemeral: true
            })
        });
        
        collector.on('end', async (collected) => {
            await message.editReply({ 
                components: [],
                ephemeral: true
            });
            
            let moreDocs = await leave.find({ user: message.member?.id });
            let staffDoc = await staff.findOne({ user: message.member?.id });
            if (!moreDocs.length) {
                staffDoc.onLeave = false;
                await staffDoc.save();
            }
            return;
        })
    }
    async runBegin(message, options) {      
        const { leave, staff } = message.client.tools.models;        
        const reason = options.get('reason').value;
        let start = options.get('start').value;
        let end = options.get('end').value;
        await message.deferReply({ ephemeral: true });
        let leaveDoc = await leave.find({ user: message.member?.id });
        let staffDoc = await staff.findOne({ user: message.member?.id });
        
        // Check blacklisted word in reason
        let cancel = { status: false, word: '' };
        for (const value of message.client.blacklistedWords.keys()) {
            if (reason.toLowerCase().includes(value)) {
                cancel.status = true;
                cancel.word = value;
                break;
            }
        };         
        if (cancel.status) return message.editReply({
            ephemeral: true,
            embeds: [message.client.tools.embed().setDescription(`You can't use \`${cancel.word}\` in your reason content.`).setColor('RED')]
        });
        
        if (leaveDoc.length > 10) return message.editReply({
            ephemeral: true,
            embeds: [message.client.tools.embed().setDescription(`You can't have more than 10 leave notices! Delete one to make a new one.`).setColor('RED')]
        });
        
        let cumStart = start.slice(6).trim();
        let cumEnd = end.slice(6).trim();

        if (start.toLowerCase() !== 'today' && start.length == 3) {
            if (cumStart.length == 4) {            
              start = moment(start, 'DD/MM/YYYY');
            } else {
              start = moment(start, 'DD/MM/YY');
            }         
        } else if (start.toLowerCase() === 'today') {
            start = moment();
        } else {
            start = moment().add(parseInt(start), 'day');            
        }

        if (end.toLowerCase() !== 'indefinite' && end.length == 3) {
          if (cumEnd.length == 4) {
              end = moment(end + ' 07:00', 'DD/MM/YYYY HH:mm');
          } else {
              end = moment(end + ' 07:00', 'DD/MM/YY HH:mm');
          }
        } else if (end.toLowerCase() == 'indefinite') {
          end = moment().add(11, 'year');
        } else {
          end = moment().add(parseInt(end), 'day');
        }

        if (!start.isValid() || !end.isValid())                
          return message.editReply({
              embeds: [message.client.tools.embed().setDescription("One of the provided date was invalid. This could be because you didn't use the proper date format, which is `DD/MM/YY` or `DD/MM/YYYY`. You have to add 0 infront if the day/month is a single digit.")],
              ephemeral: true
          });
   
        if (end.isBefore(start)) return message.editReply({
            ephemeral: true,
            embeds: [message.client.tools.embed().setDescription('You can\'t have the end date start before the start date.').setColor('RED')]
        });
        
        if (start.format('DD/MM/YYYY') == moment().format('DD/MM/YYYY')) {
          staffDoc.onLeave = true;
          await staffDoc.save();
        }
          
        await new leave({                    
          user: message.member?.id,
          start: start,
          end: end,
          reason: reason,
        }).save();
        
        await message.editReply({ 
          content: message.client.config.tick,
          ephemeral: true
        });        
        return message.guild.channels.cache.get('757169784747065364').send({
        embeds: [message.client.tools.embed().setAuthor(message.member?.user?.username, message.member?.user?.displayAvatarURL({ dynamic: true })).addField('Starting', `<t:${start.unix()}:R>`, true).addField('Ending', `<t:${end.unix()}:R>`, true).setDescription(`New leave notice from ${message.member}\n\n***__${reason}__***`)]
        });
    }
};