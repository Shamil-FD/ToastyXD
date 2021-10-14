const Command = require('../../structure/SlashCommand');

module.exports = class BlacklistCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'blacklist',
        category: 'Staff',
        staffLevel: 1,
        description: 'Add/Delete/View blacklist words',  
        cooldownDelay: 5000,
        subCommands: ['delete', 'add', 'view'],
        options: [
            {
                name: 'delete', description: 'Delete a blacklisted word.',
                type: 'SUB_COMMAND', options: [
                    {
                        name: 'word', type: 'STRING',
                        required: true, description: 'Word'
                    }
                ]
            },
            {
                name: 'view', description: 'View blacklisted words.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'add', description: 'Blacklist a new word.',
                type: 'SUB_COMMAND', options: [
                    {
                        name: 'word', type: 'STRING',
                        description: 'Word', required: true
                    },
                    {
                        name: 'action', type: 'STRING',
                        description: 'What action to take when a message with this word is found.', required: true,
                        choices: [{ name: 'delete', value: 'delete' }, { name: 'kick', value: 'kick' }, { name: 'ban', value: 'ban' }, { name: 'warn', value: 'warn'}]
                    },
                    {
                        name: 'wildcard', type: 'BOOLEAN',
                        description: 'If this word should be found in any part of a word.'
                    }
                ]
            }
        ]
      });
    }
    async runAdd(message, options) {
        const word = options.get('word').value;        
        const isWild = options.get('wildcard')?.value ?? false;
        const action = options.get('action').value;        
        const doc = await message.client.tools.models.blacklist.findOne({ word: word.toLowerCase() });
        if (doc) return message.reply({
            embeds: [message.client.tools.embed().setDescription(`${word} is already blacklisted.`).setColor('RED')],
            ephemeral: true
        });
        
        await new message.client.tools.models.blacklist({            
            word: word.toLowerCase(),
            action: action,
            wild: isWild,
        }).save();
        await message.client.blacklistedWords.push({ word: word, action: action, wild: isWild });
        return message.reply({
            embeds: [message.client.tools.embed().setDescription(`${word} has been blacklisted.`)],
            ephemeral: true
        })
    }
    async runView(message, options) {
        let docs = await message.client.tools.models.blacklist.find();
        docs = await docs.map((docs) => `${message.client.config.arrow} ${docs.word} - ${docs.action} ${docs.wild ? `- wildcard` : ''}`).join('\n');
        return message.reply({
            embeds: [message.client.tools.embed().setDescription(docs)],
            ephemeral: true
        });
    }
    async runDelete(message, options) {
        const doc = await message.client.tools.models.blacklist.findOne({ word: options.get('word').value.toLowerCase() });
        await message.deferReply({ ephemeral: true });
        
        if (!doc) return message.editReply({
            embeds: [message.client.tools.embed().setDescription('It\'s not blacklisted.').setColor('RED')],
            ephemeral: true
        });
        
        message.client.blacklistedWords = message.client.blacklistedWords.filter(item => item.word !== options.get('word').value.toLowerCase());
        await doc.delete();
        return message.editReply({
            embeds: [message.client.tools.embed().setDescription(`${options.get('word').value} has been whitelisted.`).setColor('GREEN')],
            ephemeral: true
        });
    }
};