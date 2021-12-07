const Command = require('../../structure/SlashCommand');

module.exports = class TagsCommand extends Command {
    constructor(context) {
      super(context, {
        name: 'tags',
        category: 'Staff',
        staffLevel: 1,
        description: 'Create/Delete/Edit tags',  
        subCommands: ['create', 'delete', 'edit'],
        options: [
            {
                name: 'edit', type: 'SUB_COMMAND', description: 'Edit a tag', options: [
                    { 
                        name: 'name', type: 'STRING', 
                        description: "Tag name", required: true
                    }, 
                    { 
                        name: 'new_content', type: 'STRING', 
                        description: 'New content of the tag', required: true
                    }, 
                    { 
                        name: 'new_name', type: 'STRING', 
                        description: 'New name of the tag'
                    }
                ]
            },
            {
                name: 'create', type: 'SUB_COMMAND',
                description: 'Create a new tag', options: [
                    { 
                        name: 'name', type: 'STRING',
                        required: true, description: 'Name of the tag'
                    },
                    {
                        name: 'content', type: 'STRING',
                        required: true, description: 'Content of the tag'
                    },
                    {
                        name: 'image', type: 'STRING',
                        description: 'An image to be displayed. This option will be removed when slash attachments come out.'
                    }
                ]
            },
            {
                name: 'delete', type: 'SUB_COMMAND',
                description: 'Delete a tag', options: [
                    {
                        name: 'name', type: 'STRING',
                        description: 'Name of the tag', required: true
                    }
                ]
            }
        ]
      });
    }
    async runDelete(message, options) {
        const name = options.get('name').value.toLowerCase();      
        const doc = await message.client.tools.models.tag.findOne({ name: name });
        if (!doc) return message.reply({ 
            embeds: [message.client.tools.embed().setDescription(`**${name}** does not exist.`).setColor('RED')]
        })
      
        await doc.delete()
        if (message.client.tags.has(name)) message.client.tags.delete(name);
      
        return message.reply({ 
            embeds: [message.client.tools.embed().setDescription(`A tag with the name of **${name}** has been deleted.`).setColor('GREEN')]
        });
    }
    async runEdit(message, options) {               
        const name = options.get('name').value.toLowerCase();      
        let doc = await message.client.tools.models.tag.findOne({ name: name });
        if (!doc) return message.reply({ 
            embeds: [message.client.tools.embed().setDescription(`**${name}** does not exist!`).setColor('RED')]
        })
      
        doc.content = options.get('new_content').value;
        if (options.get('new_name')?.value) doc.name = options.get('new_name').value;
        await doc.save()
        
        return message.reply({ 
            embeds: [message.client.tools.embed().setDescription(`A tag with the name of **${name}** has been edited.`).setFooter('Use t)tagname or s!tagname to use the tag').setColor('GREEN')]
        })
    }
    async runCreate(message, options) {
        const name = options.get('name').value.toLowerCase();      
        const content = options.get('content').value      
        const image = options.get('image')?.value;      
        const files = []
        const doc = await message.client.tools.models.tag.findOne({ name: name });
        if (doc) return message.reply({ 
            embeds: [message.client.tools.embed().setDescription(`**${name}** already exists!`).setColor('RED')]
        })
      
        /*if (message?.attachments.size > 0) {            
            await message.attachments.forEach(file => files.push(file.url))
        }*/
        if (image) files.push(image);
        
        await new message.client.tools.models.tag({ name: name, content: content, files: files }).save();
        if (!message.client.tags.has(name)) message.client.tags.set(name, { name: name });
      
        return message.reply({
            embeds: [message.client.tools.embed().setDescription(`A tag with the name of **${name}** has been created.`).setFooter('Use t)tagname or s!tagname to use the tag').setColor('GREEN')]
        });
    }
};