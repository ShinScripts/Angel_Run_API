import { Client, Collection, CommandInteraction } from 'discord.js';
import { readdirSync } from 'fs';
import consola from 'consola';

declare module 'discord.js' {
	export interface Client {
		commands: Collection<string, any>;
	}
}

export class DiscordClient extends Client {
	constructor() {
		super({ intents: 32767 });
	}

	public init() {
		this.commands = new Collection();

		this.on('interactionCreate', async (interaction) => {
			if (!interaction.isCommand() || interaction.channel.type === 'DM') return;

			const command = this.commands.get(interaction.commandName);

			if (command) {
				command.run(interaction, this);
			}
		});

		this.on('ready', async () => {
			consola.success(`${this.user.tag} is now online`);

			const arrayOfSlashCommands = [];

			const commandArray = readdirSync(`${__dirname}/commands/`).map(async (value) => {
				const command = await import(`./commands/${value}`);

				this.commands.set(command.default.name, command.default);
				arrayOfSlashCommands.push(command.default);
			});

			await Promise.all(commandArray);

			await this.guilds.cache
				.get('961266286338408488')
				.commands.set(arrayOfSlashCommands)
				.then(() => consola.info('Commands loaded'));

			this.user.setPresence({
				activities: [{ name: 'the Angel Runners', type: 'WATCHING' }],
			});
		});

		this.login(process.env.TOKEN);
	}
}
