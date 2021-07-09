const Command = require('../../Struct/Command.js');
const { execSync } = require('child_process');
const sourcebin = require('sourcebin');
const path = require('path');
const fs = require('fs');

module.exports = class ApproveCmdCommand extends Command {
  constructor() {
    super('approvecmd', {
      aliases: ['approvecmd'],
      category: 'Dev',
      ownerOnly: true,
      args: [
        {
          id: 'id',
        },
        {
          id: 'name',
          match: 'rest',
        },
      ],
    });
  }

  async exec(message, { id, name }) {
    if (!id)
      return message.reply({
        embeds: [this.client.tools.embed().setDescription('You have to provide a message ID dumbass!')],
      });
    if (!name)
      return message.reply({
        embeds: [this.client.tools.embed().setDescription('You have to provide the command name, dumbass!')],
      });

    let doc = await this.client.tools.models.customCmd.findOne({ msg: id });
    if (!doc)
      return message.reply({
        embeds: [this.client.tools.embed().setDescription("That ID doesn't exist on my database dumbass.")],
      });

    if (doc?.approvers.includes(message.author.id))
      return message.reply({
        embeds: [this.client.tools.embed().setDescription('You already approved it once dumbass.')],
      });

    doc?.approvers.push(message.author.id);
    await doc.save();

    if (doc?.approvers.length == 2) {
      try {
        let code = await sourcebin.get(doc.link);

        let codeMsg = await this.client.channels.cache.get('861683396518739978')?.messages.fetch(doc.msg);
        if (!codeMsg) {
          await doc.delete();
          return message.reply({ embeds: [this.client.tools.embed().setDescription("The message doesn't exist!")] });
        }
        await codeMsg.edit({
          embeds: [
            this.client.tools
              .embed()
              .setDescription(codeMsg?.embeds[0]?.description)
              .setAuthor(codeMsg?.embeds[0]?.author?.name, codeMsg?.embeds[0]?.author?.iconURL)
              .setFooter('APPROVED'),
          ],
        });
        await fs.writeFileSync(
          `${path.dirname(require?.main?.filename)}${path.sep}Commands/Custom/${name}.js`,
          code.files[0].content,
          { flag: 'a+' },
        );
        await execSync(
          `git add . && git commit -m "A new custom command from ${await message.guild.members.cache.get(doc.user)
            ?.displayName}" && git push https://${require('../../Util/Config')?.GitAcc?.name}:${
            require('../../Util/Config')?.GitAcc?.pass
          }@github.com/Shamil-FD/ToastyXD.git master`,
        );

        await message.reply(`Restarting.`);
        await doc.delete();
        return execSync('npm i && pm2 reload Toasty');
      } catch (e) {
        console.log(e);
        await doc.delete();
        return message.reply({
          embeds: [this.client.tools.embed().setDescription(`There was an error.\n\`\`\`\n${e.stack}\n\`\`\``)],
        });
      }
    } else {
      let codeMsg = await this.client.channels.cache.get('861683396518739978')?.messages.fetch(doc.msg);
      if (!codeMsg) {
        await doc.delete();
        return message.reply({ embeds: [this.client.tools.embed().setDescription("The message doesn't exist!")] });
      }
      await codeMsg.edit({
        embeds: [
          this.client.tools
            .embed()
            .setDescription(codeMsg?.embeds[0]?.description)
            .setAuthor(codeMsg?.embeds[0]?.author?.name, codeMsg?.embeds[0]?.author?.iconURL)
            .setFooter(`1/2 Devs approved this.`),
        ],
      });

      return message.reply({ embeds: [this.client.tools.embed().setDescription('1/2 Devs approved this command.')] });
    }
  }
};
