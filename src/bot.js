const TelegramBot = require('node-telegram-bot-api');
const config = require('../Config.js');
const Game = require('./Game.js');

const bot = new TelegramBot(config.token, { polling: true });

bot.onText(/\/start/, (msg) => {
	const chatID = msg.chat.id;
	if (Game.getGameByChatId(chatID)) {
		bot.sendMessage(chatID, `Game already created`);
	} else {
		if (msg.chat.type == 'private' || msg.chat.type == 'channel') {
			bot.sendMessage(chatID, `Start the game in a group chat`);
		} else {
			const game = new Game(chatID, bot);
			bot.sendMessage(chatID, `Game created! 1/4\n- ${msg.from.username}`, {
				reply_markup: {
					inline_keyboard: [
						[{ text: 'Join', callback_data: 'join_game' }]]
				}
			});
			game.join(msg.from);
		}
	}
});

bot.on('callback_query', (query) => {
	const callback_data = query.data;
	const msg = query.message;
	const game = Game.getGameByChatId(msg.chat.id);
	if (callback_data == "join_game") {
		if (game.join(query.from)) {
			const opts = { chat_id: msg.chat.id, message_id: msg.message_id };
			bot.editMessageText(`${msg.text.substring(0, 14)}${game.playerCount}${msg.text.substring(14 + 1)}\n- ${query.from.username}`, opts);
			if (game.isFull()) {
				game.isActive = true;
				bot.editMessageReplyMarkup({}, opts).catch(() => {}); // remove button
				bot.sendMessage(msg.chat.id, `All players found.\nStarting game.`);
				game.pingCurrentPlayer();
			} 
		} // we don't expect to encounter a failure to join, since the button will be removed upon the game becoming full
	}
});

bot.onText(/\/join/, (msg) => {
	Game.getGameByChatId(msg.chat.id).join(msg.from);
});

bot.onText(/hand/, (msg) => {
	Game.getGameByUserId(msg.chat.id).showHand(msg.from);
});

bot.onText(/sort/, (msg) => {
	Game.getGameByUserId(msg.chat.id).sortHand(msg.from);
});

bot.onText(/status/, (msg) => {
	Game.getGameByUserId(msg.chat.id).showStatus(msg.from);
});

bot.onText(/play/, (msg) => {
	Game.getGameByUserId(msg.chat.id).play(msg.from, msg.text);
});

bot.onText(/pass/, (msg) => {
	Game.getGameByUserId(msg.chat.id).pass(msg.from);
});