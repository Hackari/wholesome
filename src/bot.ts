import TelegramBot, { CallbackQuery, Message, User } from 'node-telegram-bot-api';
import { Game } from './game';
const config = require('../config.js');

const bot = new TelegramBot(config.token, { polling: true });

bot.onText(/\/start/, (msg: Message) => {
	const chatID = msg.chat.id;
	const usr = msg.from as User;
	if (Game.getGameByChatId(chatID)) {
		bot.sendMessage(chatID, `Game already created`);
	} else {
		if (msg.chat.type == 'private' || msg.chat.type == 'channel') {
			bot.sendMessage(chatID, `Start the game in a group chat`);
		} else {
			const game = new Game(chatID, bot);
			game.start(usr);
		}
	}
});

bot.on('callback_query', (query: CallbackQuery) => {
	const callback_data = query.data as string; // ensure that every callback has data
	const msg = query.message;
	if (msg != undefined) {
		if (callback_data == "join_game") { // this will only originate from a message in the group chat
			const game = Game.getGameByChatId(msg.chat.id);
			game.join(query.from, msg);
			return;
		}
		if (callback_data.startsWith("reshuffle_")) { // this will only originate from a message in the private chat
			const game = Game.getGameByUserId(query.from.id);
			game.voteReshuffle(query.from, msg, callback_data.substring(10));
			return;
		}
	}
});

// bot.onText(/\/join/, (msg: Message) => {
// 	 Game.getGameByChatId(msg.chat.id).addPlayer(msg.from as User);
// });

bot.onText(/hand/, (msg: Message) => {
	Game.getGameByUserId(msg.chat.id).showHand(msg.from as User);
});

bot.onText(/sort/, (msg: Message) => {
	Game.getGameByUserId(msg.chat.id).sortHand(msg.from as User);
});

bot.onText(/status/, (msg: Message) => {
	Game.getGameByUserId(msg.chat.id).showStatus(msg.from as User);
});

// don't like the scoping here but its better than creating
// multiple event listeners that cannot be destroyed
const cards: { [userId: number]: string[] } = {};
bot.onText(/^(1[0-3]|[1-9])$/, (msg: Message) => {
	cards[msg.chat.id].push(msg.text as string);
});

bot.onText(/play/, (msg: Message) => { 
	const userId = msg.chat.id;
	Game.getGameByUserId(userId).play(msg.from as User, [...cards[userId]]);
	delete cards[userId];
});

bot.onText(/pass/, (msg: Message) => {
	Game.getGameByUserId(msg.chat.id).pass(msg.from as User);
});
