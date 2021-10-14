const { MessageActionRow, MessageAttachment, MessageButton } = require('discord.js');
const { Listener } = require('@sapphire/framework');
const prettyMs = require('pretty-ms');
const moment = require('moment');
const _ = require('lodash');

module.exports = class ButtonInteractionListener extends Listener {
    constructor(context) {
        super(context, { 
            event: 'interactionCreate'
        })
    }
    async run(interaction) {        
        if (interaction.client.config.testMode) return;
        if (!interaction.isButton()) return;
        
        if (interaction.customId.toLowerCase() == 'appealclose') return this.appealCloseBtn(interaction);
        else if (interaction.customId.toLowerCase() == 'appealopen') return this.appealOpenBtn(interaction);
        else if (interaction.customId.toLowerCase() == 'appealaccept') return this.appealAcceptBtn(interaction);
        else if (interaction.customId.toLowerCase() == 'appealdeny') return this.appealDenyBtn(interaction);
        else if (interaction.customId.toLowerCase() == 'appealdelete') return this.appealDeleteBtn(interaction);
        else if (interaction.customId.includes('verification')) return this.verificationBtn(interaction);
        else if (interaction.customId.includes('archivethread')) return this.archiveThreadBtn(interaction);
        else if (interaction.customId.toLowerCase() == 'verifynow') return this.verifyNowBtn(interaction);
    }
    async archiveThreadBtn(interaction) {
        let chnlId = interaction.customId.replace('archivethread', '').trim();
        let { embed } = interaction.client.tools;
         
        if ((!interaction.member.roles.cache.has(interaction.client.config.staffRole) && !interaction.member.roles.cache.has(interaction.client.config.devHelperRole))) return interaction.reply({ content: `<@${interaction.member.id}>,`, embeds: [embed().setDescription(`Only people with <@&${interaction.client.config.devHelperRole}> role or <@&${interaction.client.config.staffRole}> can use this button.`).setColor('RED')] });
          
        if (interaction.channel.id === chnlId) {
            await interaction.channel.send({ embeds: [embed().setDescription(`This thread has been archived by <@${interaction.member.id}>.`).setColor('RED').setTitle('Thread Archived')] });
            return interaction.channel.setArchived(true, `by ${interaction.member.user.tag}`);
        }
        return;
    }
    async verifyNowBtn(interaction) {
        if (!interaction.member.roles.cache.get(interaction.client.config.notVerifiedRole)) 
            return interaction.reply({
                embeds: [interaction.client.tools.embed().setDescription("You're already verified.")],
                ephemeral: true,
            });

        let doc = await interaction.client.tools.models.verification.findOne({ user: interaction.member.id });
        let cap = await interaction.client.tools.captcha();
        let buttons = [];
        let buttonColors = ['PRIMARY', 'DANGER', 'SUCCESS', 'PRIMARY', 'DANGER', 'SUCCESS'];
        let buttonColor = await buttonColors[await Math.round(Math.random() * buttonColors.length)];
        buttons.push(new MessageButton().setLabel(cap.word).setCustomId(`verification${cap.word}`).setStyle(buttonColor));
        for (let i = 0; i < cap.randomNumbers.length - 1; i++) {            
            buttons.push(new MessageButton().setLabel(cap.randomNumbers[i]).setCustomId(`verification${cap.randomNumbers[i]}`).setStyle(buttonColors[i]));
        }
        buttons = await _.shuffle(buttons);
        if (!doc) {            
            await new interaction.client.tools.models.verification({                
                user: interaction.member.id,
                code: cap.word,
                count: 0,
                startedAt: Date.now(),
            }).save();
        } else {            
            doc.code = cap.word;
            doc.startedAt = Date.now();
            await doc.save();
        }
        await interaction.reply({
            embeds: [interaction.client.tools.embed().setDescription('**Please click on the button corresponding to the code shown in the image above.\n\nIf the code is broken, use the button again to create a new one.\nThis message will be deleted in 5 minutes.**').setColor(cap.randomColor)],
            content: `<@${interaction.member.id}>,`,
            files: [new MessageAttachment(cap.png, 'verify.png')],
            ephemeral: true,
            components: [new MessageActionRow().addComponents(buttons)],
        });
    }
    async verificationBtn(interaction) {        
        let member = await interaction.guild.members.fetch(interaction.member.id);
        let doc;
        if (member) doc = await interaction.client.tools.models.verification.findOne({ user: member.id });
        if (!member || interaction.member.id !== member.id || !doc)
            return interaction.reply({                
                embeds: [interaction.client.tools.embed().setDescription(`Nice try, but you can't use another person's verification message.`),],
                ephemeral: true,
            });

        doc?.count ? doc.count++ : (doc.count = 1);
        await doc.save();
        if (interaction.customId.replace('verification', ' ').trim() != doc.code) {            
            if (doc?.count == 5) {                
                await interaction.client.channels.cache.get(interaction.client.config.staffReportChnl).send({
                    embeds: [interaction.client.tools.embed().setDescription(`Kicked ${member.user.tag} | ${member.id} for exceeding 5 incorrect verification attempts.`).setTitle('Member Kick')]
                });                
                await member.send({                    
                    embeds: [interaction.client.tools.embed().setDescription(`You've been kicked from Salvage Squad for exceeding 5 incorrect verification attempts. In simpler terms, you are too dumb to be in the server.`)]
                }).catch(() => {});
                return member.kick('5 incorrect verification attempts.');
            }
            
            return interaction.reply({
                embeds: [interaction.client.tools.embed().setDescription(`You clicked the wrong button, you have ${5 - doc.count} more attempts until you get kicked! Please check which button is the same as the code shown in the image.\n\nIf the code is broken, use the button again for a new code.`)],
                ephemeral: true,
            });
        }
        
        await interaction.reply({
            embeds: [interaction.client.tools.embed().setDescription(`Thanks for joining ${interaction.guild.name}! Have an amazing stay!`)],
            ephemeral: true,
        });
        await member.roles.remove(interaction.client.config.notVerifiedRole).catch((e) => console.log('Issue on removing verified role:', e));
        await interaction.client.channels.cache.get(interaction.client.config.staffReportChnl).send({
            embeds: [interaction.client.tools.embed().setDescription(
                `${interaction.client.config.arrow} **User**: ${member.user.tag} | \`${member.id}\`\n${
                  interaction.client.config.arrow
                } **Code**: \`${doc.code}\`\n${interaction.client.config.arrow} **Tries**: \`${doc.count}\`\n${
                  interaction.client.config.arrow
                } **Time Took To Verify**: ${prettyMs(Date.now() - doc.startedAt)}`
            ).setTitle('Member Verfied')]
        });
        return doc.delete();
    }
    async appealDeleteBtn(interaction) {
        if (!interaction.member.roles.cache.has('823124026623918082')) 
            return interaction.reply({
                embeds: [interaction.client.tools.embed().setDescription('Only staff can use this button.')],
            });
        await interaction.reply({ 
            embeds: [interaction.client.tools.embed().setDescription(`Deleting this channel in 5 seconds..`)],
        });
        await interaction.client.tools.wait(5000);
        return interaction.channel.delete()
    }
    async appealDenyBtn(interaction) {
        let member = await this.getMember(interaction);
        if (!interaction.member.roles.cache.has('823124026623918082'))
            return interaction.reply({
                embeds: [interaction.client.tools.embed().setDescription('Only staff can use this button.')],
            });        
        if (!member) return interaction.reply({            
            embeds: [interaction.client.tools.embed().setDescription("I couldn't find the member in the server.")],
        });

        let guild = await interaction.client.guilds.cache.get('655109296400367618');
        let bannedInfo = await guild.bans.fetch(member.id);
        if (!bannedInfo) return interaction.reply({ 
            embeds: [interaction.client.tools.embed().setDescription(`I couldn't find ${member}'s ban in Salvage Squad.`)],
        });

        await member.send({
            embeds: [interaction.client.tools.embed().setTitle('Unbanned').setDescription(`Your unban form was denied`)],
        }).catch(() => {});
        
        await interaction.reply({
            embeds: [interaction.client.tools.embed().setDescription(`${member.user.tag} | ${member.id} has been denied`)],
        });
        await member.ban();
        return interaction.message.edit({            
            embeds: interaction.embeds,
            components: [new MessageActionRow().addComponents([new MessageButton().setStyle('DANGER').setLabel('Delete').setCustomId('appealdelete')])],
        });
    }
    async appealAcceptBtn(interaction) {
        let member = await this.getMember(interaction);
        if (!member) return interaction.reply({            
            embeds: [interaction.client.tools.embed().setDescription("I couldn't find the member in the server.")],
        });

        let guild = await interaction.client.guilds.cache.get('655109296400367618');
        let bannedInfo = await guild.bans.fetch(member.id).catch(() => {            
            return undefined;
        });
        if (!bannedInfo) return interaction.reply({            
            embeds: [interaction.client.tools.embed().setDescription(`I couldn't find ${member}'s ban in Salvage Squad.`)],
        });

        await guild.members.unban(member.id, { reason: `Unbanned by ${interaction.member.user.tag}` });
        await guild.channels.cache.get(interaction.client.config.staffReportChnl).send({
          embeds: [interaction.client.tools.embed().setTitle('Member Unban').setDescription(`User: ${member.user.tag} | ${member.user.id}\nUnbanned By: ${interaction.member.user.tag} | ${interaction.member.id}`)]
        });
        
        await member.send({            
            embeds: [interaction.client.tools.embed().setTitle('Unbanned').setDescription(`Your unban form was accepted and you are now unbanned in Salvage Squad. Here's a link to the [server](https://discord.gg/CBqNKzW7rn)`)]
        }).catch(() => {});
        
        await interaction.reply({            
            embeds: [interaction.client.tools.embed().setDescription(`${member.user.tag} | ${member.id} has been unbanned from Salvage Squad.`)]
        });
        await member.kick();        
        
        return interaction.message.edit({            
            embeds: interaction.embeds,
            components: [new MessageActionRow().addComponents([new MessageButton().setStyle('DANGER').setLabel('Delete').setCustomId('appealdelete')])],
        });
    }
    async appealOpenBtn(interaction) {
        let member = await this.getMember(interaction);        
        if (!interaction.member.roles.cache.has('823124026623918082')) 
            return interaction.reply({
                embeds: [interaction.client.tools.embed().setDescription('Only staff can use this button.')],
            });
        
        if (!member) return interaction.reply({
            embeds: [interaction.client.tools.embed().setDescription("I couldn't find the member in the server.")],
            });
        
        await interaction.channel.permissionOverwrites.create(member.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
        await interaction.reply({            
            content: `Hey <@${member.id}>`,
            embeds: [interaction.client.tools.embed().setDescription(`${member} can now see this channel.`)],
        });
        
        let closebtn = new MessageButton().setStyle('DANGER').setLabel('Close').setCustomId('appealclose');
        return interaction.message.edit({            
            embeds: interaction.embeds,
            components: [new MessageActionRow().addComponents([closebtn])],
        });
    }
    async appealCloseBtn(interaction) {        
        if (!interaction.member.roles.cache.has('823124026623918082'))
            return interaction.reply({                
                embeds: [interaction.client.tools.embed().setDescription('Only staff can use this button.')],
            });

        let member = await this.getMember(interaction);        
        if (!member) return interaction.reply({ 
            embeds: [interaction.client.tools.embed().setDescription("I couldn't find the member in the server.")],
        });

        await interaction.channel.permissionOverwrites.create(member.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
        await interaction.reply({
            embeds: [interaction.client.tools.embed().setDescription(`${member} now isn\'t able to see this channel.`)],
        });
        
        let acceptbtn = new MessageButton().setStyle('SUCCESS').setLabel('Accept').setCustomId('appealaccept');
        let openbtn = new MessageButton().setStyle('PRIMARY').setLabel('Open').setCustomId('appealopen');
        let deletebtn = new MessageButton().setStyle('DANGER').setLabel('Delete').setCustomId('appealdelete');
        let denybtn = new MessageButton().setStyle('DANGER').setLabel('Deny').setCustomId('appealdeny');
        
        return interaction.message.edit({
            embeds: interaction.embeds,
            components: [new MessageActionRow().addComponents([acceptbtn, denybtn, openbtn, deletebtn])],
        });
    }
    async getMember(interaction) {        
        let member = await interaction.guild.members.fetch(interaction.channel.topic.slice(5).trim());
        return member || undefined;
    }
}