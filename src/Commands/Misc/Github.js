const Command = require('../../Struct/Command');
const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');

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

	async exec(message, {author, repo}) {
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

		const data = await fetch(
			`https://api.github.com/repos/${author[0]}/${encodeURIComponent(
				repo[1],
			)}`,
			{headers: {'User-Agent': author}},
		);
		if (data.status !== 200)
			return message.send({
				embeds: {description: "Couldn't find that repository.", color: 'RED'},
			});

		const json = await data.json();
		if (!json.name)
			return message.send({
				embeds: {
					description: "Couldn't find that repository.",
					color: 'RED',
				},
			});

		const embed = new MessageEmbed()
			.setTitle(`Info on ${repo[1]}`)
			.setDescription(json.description)
			.addFields([
				{
					name: 'Stars',
					value: json.stargazers_count.toLocaleString(),
					inline: true,
				},
				{
					name: 'Watchers',
					value: json.subscribers_count.toLocaleString(),
					inline: true,
				},
				{
					name: 'Forks',
					value: json.forks_count.toLocaleString(),
					inline: true,
				},
				{
					name: 'Most Used Language',
					value: json?.language || 'None',
					inline: true,
				},
				{
					name: 'Archived',
					value: json.archived ? 'Yes' : 'No',
					inline: true,
				},
				{
					name: 'Fork',
					value: json.fork ? 'Yes' : 'No',
					inline: true,
				},
				{
					name: 'License',
					value: json.license?.name || 'No License',
					inline: true,
				},
			])
			.setURL(json.html_url)
			.setAuthor(json.owner.login, json.owner.avatar_url, json.owner.html_url)
			.setFooter('Created At')
			.setTimestamp(new Date(json.created_at))
			.setColor('GREEN');
		return message.send(embed);
	}
}

module.exports = GithubCommand;
