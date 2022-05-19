import { Server } from './server';
import { DiscordClient } from './DiscordBot';

const client = new DiscordClient();
export const server = new Server();

server.init(client);
client.init();
