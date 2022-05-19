import { SlashCommandBuilder } from '@discordjs/builders';
import { Client, CommandInteraction, EmbedFieldData, MessageEmbed } from 'discord.js';
import { server } from '..';
import { User } from '../interfaces';

export default {
	...new SlashCommandBuilder().setName('leaderboard').setDescription('Shows the current leaderboard'),
	run: async (interaction: CommandInteraction, client: Client) => {
		await interaction.deferReply();

		const emojis = ['🏆', '<a:glitter:964901605201825853>'];

		interaction.followUp({
			embeds: [
				new MessageEmbed()
					.setTitle('Top 15 players')
					.setColor('BLUE')
					.setTimestamp()
					.setThumbnail(
						'https://cdn.discordapp.com/attachments/964892593655791676/966639035571388466/trophy.png'
					)
					.setDescription(
						(server.getLeaderboard(15) as unknown as Object[])
							.map((player: User, i: number) => {
								return `${i + 1}. ${player.username} (${player.score} meters)`;
							})
							.toString()
							.replaceAll(',', '\n')
					)
					.setFooter({ text: 'Angel Run Leaderboard', iconURL: client.user.avatarURL() }),
			],
		});
	},
};
