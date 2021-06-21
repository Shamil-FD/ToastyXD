const Command = require('../../Struct/Command.js');
const { verif } = require('../../Util/Models');

module.exports = class VerifyCommand extends Command {
  constructor() {
    super('verify', {
      aliases: ['verify'],
      category: 'Verification',
      channel: 'guild',
      cooldown: 3000,
      description: {
        info: "Verify with your code to get access to the server. If you don't have a code, type t)newcode to get a new one.",
        usage: ['t)verify Your-Code'],
      },
      args: [{ id: 'code' }],
    });
  }

  async exec(message, { code }) {
    // Check For The Not Verified Role
    if (!message.member.roles.cache.get(this.client.config.NotVerifiedRole))
      return message.send(this.client.embed().setDescription("You're already verified."));

    if (!code)
      return message.send(
        this.client
          .embed()
          .setDescription(
            "You can't verify by not giving me the code! If you don't have a code, create one using `t)newcode`",
          ),
      );

    let doc = await verif.findOne({ user: message.author.id });

    if (!doc) {
      return message.send({
        embeds: {
          description:
            "You don't have a code attached to your account. Please create one using the command `t)newcode`",
        },
      });
    } else if (code.toLowerCase() === 'ppsmol' && doc.code !== code) {
      return message.send({
        embeds: {
          title: 'Dumb alert!',
          description: 'Why are you so dumb?',
        },
      });
    } else if (doc.code != code) {
      doc.count++;
      doc.save();

      if (doc.count > 5) {
        await message.author
          .send({
            embeds: [
              this.client
                .embed()
                .setDescription(`You were kicked from ${message.guild.name}\nReason: You failed to verify 5+ times.`),
            ],
          })
          .catch(() => {});

        await message.member.kick();
        await doc.delete();
        return message.guild.channels.cache.get(this.client.config.StaffReportChnl).send({
          embeds: [
            this.client
              .embed()
              .setTitle('Kicked')
              .setDescription(
                `Kicked ${message.author.tag} | ${message.author.id} for failing 5+ times while verifying.`,
              ),
          ],
        });
      }

      return message.send({
        embeds: {
          description:
            '**Please provide me the correct code!\nMake sure that is YOUR code\nIf the code is not readable, then use `t)newcode` to get a new one**',
        },
      });
    }

    message.guild.channels.cache.get(this.client.config.StaffReportChnl).send({
      embeds: [
        this.client
          .embed()
          .setTitle('Verification Complete')
          .setDescription(`${message.author.tag} | ${message.author.id} has completed the captcha.`)
          .addField('Captcha Info', `Code: ${doc.code} | Tries: ${doc.count}`),
      ],
    });

    await message.member.roles.remove(this.client.config.NotVerifiedRole);
    await message.react('✅');
    return doc.delete();
  }
};
