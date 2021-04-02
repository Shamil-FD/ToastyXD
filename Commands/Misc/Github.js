const Command = require('../../Util/Command');
const phin = require('phin');
const { MessageEmbed } = require('discord.js');

class GithubCommand extends Command {
	constructor() {
		super('github', {
			aliases: ['github', 'githubrepo'],
			category: 'misc',
			channel: 'guild',
			separator: '/',
			args: [
				{
					id: 'author',
					type: 'string',
					match: 'separate',
				},
				{
					id: 'repo',
					type: 'string',
					match: 'separate',
				},
			],
		});
	}

	async exec(message, { author, repo }) {
		if (!author)
			return message.send({
				embeds: {
					description: 'Specify the owner of the repos username',
					color: 'RED',
				},
			});
		if (!repo)
			return message.send({
				embeds: {
					description: 'Specify the repository name.',
					color: 'RED',
				},
			});

		const data = await phin({
			url: `https://api.github.com/repos/${author[0]}/${encodeURIComponent(
				repo[1]
			)}`,
			method: 'get',
			parse: 'json',
			headers: {
				'User-Agent': author,
			},
		});
		if (data.statusCode !== 200)
			return message.send({
				embeds: { description: "Couldn't find that repository.", color: 'RED' },
			});
        if(!data.body.name) return message.send({ embeds: { description: "Couldn't find that repository.", color: "RED"}})

		const embed = new MessageEmbed()
			.setTitle(`Info on ${repo[1]}`)
            .setDescription(data.body.description)
			.addFields([
				{
					name: 'Stargazers',
					value: data.body.stargazers_count.toLocaleString(),
					inline: true,
				},
				{
					name: 'Watchers',
					value: data.body.subscribers_count.toLocaleString(),
					inline: true,
				},
				{
					name: 'Forks',
					value: data.body.forks_count.toLocaleString(),
					inline: true,
				},
				{
					name: 'Most Used Language',
					value: data.body?.language || 'None',
					inline: true,
				},
				{
					name: 'Archived',
					value: data.body.archived ? 'Yes' : 'No',
					inline: true,
				},
                {
                    name: 'Fork',
                    value: data.body.fork ? 'Yes' : 'No',
                    inline: true
                },
                {
                    name: 'License',
                    value: data.body.license?.name || 'No License',
                    inline: true
                }
			])
			.setURL(data.body.html_url)
			.setAuthor(
				data.body.owner.login,
				data.body.owner.avatar_url,
				data.body.owner.html_url
			)
			.setFooter('Created At')
			.setTimestamp(new Date(data.body.created_at))
			.setColor('GREEN');
		return message.send(embed);
	}
}

module.exports = GithubCommand;
