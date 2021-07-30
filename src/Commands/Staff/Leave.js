const customParseFormat = require('dayjs/plugin/customParseFormat');
const { leave, staff } = require('../../Util/Models');
const Command = require('../../Struct/Command.js');
const dayjs = require('dayjs');
dayjs.extend(customParseFormat);

module.exports = class LeaveCommand extends Command {
  constructor() {
    super('leave', {
      aliases: ['leave'],
      category: 'Staff',
      channel: 'guild',
      staffOnly: true,
      useSlashCommand: true,
      description: {
        info: 'Start or End an inactive notice. Date Format: DD/MM/YYYY OR DD/MM/YY OR DD-MM-YYYY OR DD-MM-YY',
        usage: ['/leave end', '/leave begin Start-Date End-Date Reason'],
      },
      slashCommand: {
        options: [
          {
            name: 'begin',
            description: 'Start your leave by using me!!',
            type: 'SUB_COMMAND',
            options: [
              {
                name: 'start',
                description: 'The start date. Format DD/MM/YYYY OR DD/MM/YY',
                required: true,
                type: 'STRING',
              },
              {
                name: 'end',
                description: "The end date or 'indefinite' for no end date. Format DD/MM/YYYY OR DD/MM/YY",
                required: true,
                type: 'STRING',
              },
              {
                name: 'reason',
                description: "Why you leaving us? I'm sad.",
                type: 'STRING',
                required: true,
              },
            ],
          },
          {
            name: 'end',
            description: 'End your leave, yay!',
            type: 'SUB_COMMAND',
          },
        ],
      },
    });
  }

  async exec(message) {
    return message.reply({
      embeds: [
        this.client.tools.embed().setDescription('This is disabled, use the slash command instead.').setColor('RED'),
      ],
    });
  }
  async execSlash(message) {
    await message.defer();
    if (message.options.getSubcommand() === 'end') {
      let doc = await leave.findOne({ user: message.member?.id });
      if (!doc)
        return message.editReply({ embeds: [this.client.tools.embed().setDescription("You aren't on leave, dummy.")] });

      await doc.delete();
      return message.editReply({
        embeds: [this.client.tools.embed().setTitle('Hey!').setDescription('Welcome back! :D')],
      });
    } else {
      let start = message.options.get('start').value;
      let end = message.options.get('end').value;
      let reason = message.options.get('reason').value;

      let cumStart = start.slice(6).trim();
      let cumEnd = end.slice(6).trim();

      if (cumStart.length == 4) {
        start = dayjs(start, 'DD/MM/YYYY');
      } else {
        start = dayjs(start, 'DD/MM/YY');
      }
      if (end.toLowerCase() !== 'indefinite') {
        if (cumEnd.length == 4) {
          end = dayjs(end + ' 07:00', 'DD/MM/YYYY HH:mm');
        } else {
          end = dayjs(end + ' 07:00', 'DD/MM/YY HH:mm');
        }
      } else {
        end = dayjs().add(11, 'year');
      }
      if (!start.isValid() || !end.isValid())
        return message.editReply(
          "One of the provided date was invalid. This could be because you didn't use the proper date format, which is `DD/MM/YY` or `DD/MM/YYYY`. You have to add 0 infront if the day/month is a single digit.",
        );

      let doc = await leave.findOne({ user: message.member?.id });
      let onLeave = await staff.findOne({ user: message.member?.id });
      if (onLeave) {
        onLeave.onLeave = true;
        await onLeave.save();
      }
      if (!doc) {
        await new leave({
          user: message.member?.id,
          start: start,
          end: end,
          reason: reason,
        }).save();
      } else {
        doc.start = start;
        doc.end = end;
        doc.reason = reason;
        await doc.save();
      }

      message.editReply(this.client.config.tick);
      return message.guild.channels.cache.get('757169784747065364').send({
        embeds: [
          this.client.tools
            .embed()
            .setAuthor(message.member?.user?.username, message.member?.user?.displayAvatarURL({ dynamic: true }))
            .addField('Reasoning:', reason)
            .addField('Starting On:', dayjs(start).format('DD MMMM YYYY'), true)
            .addField('Ending By:', dayjs(end).format('DD MMMM YYYY'))
            .setDescription(`Goodbye to ${message.member}!`),
        ],
      });
    }
  }
};
