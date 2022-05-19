import { Client, GuildChannel, MessageEmbed, TextChannel } from 'discord.js';
import express, { Response } from 'express';
import http from 'http';
import consola from 'consola';
import db from 'quick.db';
import { User } from './interfaces';
import dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/.env` });

export class Server {
	constructor() {}

	private sortLeaderboard() {
		return Array.from(db.get('playerData') as User[]).sort((a: User, b: User) => b.score - a.score);
	}

	public getLeaderboard(amount?: number) {
		return this.sortLeaderboard().slice(0, amount);
	}

	public init(client: Client) {
		const app = express().use(express.json());

		// [GET] landing page
		app.get('/', (req, res) => {
			res.sendStatus(200);
		});

		// [POST] postscore
		app.post('/postscore', async (req, res) => {
			if (req.headers['authorization'] !== process.env.API_AUTH) {
				res.sendStatus(401);
				return;
			}

			const { username, score } = req.query as unknown as User;

			if (!username || !score) {
				res.sendStatus(400);
				return;
			}

			if ((db.get('playerData') as User[]).find((player) => player.username === username)) {
				db.set(
					'playerData',
					(db.get('playerData') as User[]).map((player, i) => {
						if (player.username === username)
							return {
								username,
								score: Number(score),
							};

						return {
							username: (db.get('playerData') as User[])[i].username,
							score: Number((db.get('playerData') as User[])[i].score),
						};
					})
				);
			} else {
				const arr = db.get('playerData') as User[];
				arr.push({ username, score: Number(score) });

				db.set('playerData', arr);
			}

			res.sendStatus(200);

			// await (
			// 	await (client.channels.fetch(LOG_CHANNEL) as Promise<TextChannel>)
			// ).send({
			// 	embeds: [
			// 		new MessageEmbed()
			// 			.setColor('RANDOM')
			// 			.setTitle('New Highscore')
			// 			.addFields([
			// 				{
			// 					name: 'Username',
			// 					value: PlayerData.username,
			// 				},
			// 				{
			// 					name: 'Score',
			// 					value: PlayerData.score.toString(),
			// 				},
			// 			])
			// 			.setTimestamp(),
			// 	],
			// });
		});

		// [GET] getleaderboard
		app.get('/getleaderboard', (req, res) => {
			if (req.headers['authorization'] !== process.env.API_AUTH) {
				res.sendStatus(401);
				return;
			}

			const { amount } = req.body;

			res.status(200).send(
				this.getLeaderboard(amount ? amount : 15)
					.map((user) => `${user.username}:${user.score}`)
					.join('/')
			);
		});

		const PORT = process.env.PORT || 8080;
		http.createServer(app).listen(PORT, async () => {
			consola.success(`Server started on port ${PORT}`);
		});
	}
}
