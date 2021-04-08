const Command = require('../../Util/Command');
const fetch = require('node-fetch');
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

		let data = await fetch(
			`https://api.github.com/repos/${author[0]}/${encodeURIComponent(
				repo[1]
			)}`,
			{ headers: { 'User-Agent': author } }
		);
		if (data.status !== 200)
			return message.send({
				embeds: { description: "Couldn't find that repository.", color: 'RED' },
			});

		data = await data.json().then((m) => {
			if (!m.name)
				return message.send({
					embeds: {
						description: "Couldn't find that repository.",
						color: 'RED',
					},
				});

			const embed = new MessageEmbed()
				.setTitle(`Info on ${repo[1]}`)
				.setDescription(m.description)
				.addFields([
					{
						name: 'Stargazers',
						value: m.stargazers_count.toLocaleString(),
						inline: true,
					},
					{
						name: 'Watchers',
						value: m.subscribers_count.toLocaleString(),
						inline: true,
					},
					{
						name: 'Forks',
						value: m.forks_count.toLocaleString(),
						inline: true,
					},
					{
						name: 'Most Used Language',
						value: m?.language || 'None',
						inline: true,
					},
					{
						name: 'Archived',
						value: m.archived ? 'Yes' : 'No',
						inline: true,
					},
					{
						name: 'Fork',
						value: m.fork ? 'Yes' : 'No',
						inline: true,
					},
					{
						name: 'License',
						value: m.license?.name || 'No License',
						inline: true,
					},
				])
				.setURL(m.html_url)
				.setAuthor(m.owner.login, m.owner.avatar_url, m.owner.html_url)
				.setFooter('Created At')
				.setTimestamp(new Date(m.created_at))
				.setColor('GREEN');
			return message.send(embed);
		});
	}
}

module.exports = GithubCommand;
