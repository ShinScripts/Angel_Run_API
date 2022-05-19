import { SlashCommandBuilder } from '@discordjs/builders';
import { Client, CommandInteraction, Message } from 'discord.js';

export default {
	...new SlashCommandBuilder().setName('ping').setDescription('Returns the client latency'),
	run: async (interaction: CommandInteraction, client: Client) => {
		await interaction.deferReply();

		const m = await interaction.followUp({
			content: 'Checking the ping...',
		});

		interaction.editReply({
			content: `Ping: \`${
				(m as Message).createdTimestamp - interaction.createdTimestamp
			}ms\`. Websocket ping: \`${Math.round(client.ws.ping)}ms\`.`,
		});
	},
};
