const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.js');
const Game = require('./Game.js');

const bot = new TelegramBot(config.token, { polling: true });


// Start
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

// Handle callbacks
bot.on('callback_query', (query) => {
	const callback_data = query.data;
	const msg = query.message;
	const game = Game.getGameByChatId(msg.chat.id);
	if (callback_data == "join_game") {
		if (game.join(query.from)) {
			const opts = { chat_id: msg.chat.id, message_id: msg.message_id };
			bot.editMessageText(`${msg.text.substring(0, 14)}${game.playerCount}${msg.text.substring(14 + 1)}\n- ${query.from.username}`, opts);
			if (game.isFull()) {
				bot.editMessageReplyMarkup({}, opts).catch(() => {}); // remove button
				bot.sendMessage(msg.chat.id, `All players found.\nStarting game.`);
			} 
		} // we don't expect to encounter a failure to join, since the button will be removed upon the game becoming full
	}
});

bot.onText(/\/join/, (msg) => {
	Game.getGameByChatId(msg.chat.id).join(msg.from);
});

bot.onText(/hand/, (msg) => {
	Game.getGameByChatId(msg.chat.id).showHand(msg.from);
});

bot.onText(/sort/, (msg) => {
	Game.getGameByChatId(msg.chat.id).sortHand(msg.from);
});

bot.onText(/status/, (msg) => {
	Game.getGameByChatId(msg.chat.id).showStatus(msg.from);
});

// function startTurn(newTurn) {
//   const playerId = playerLookup[turn];
//   const player = players[turn];
//   const chatId = playerId;
//   if (finishedCount == MAX_PLAYERS) {
//     broadcastMsg("Game has ended.")
//     let rankings = "";
//     for (let i = 0; i < MAX_PLAYERS; i++) {
//       let playerName = players[turn].username;
//       let place = end[i] + 1;
//       rankings += `${playerName}: ${place}\n`
//     }
//     broadcastMsg(rankings);
//     return;
//   }

//   if (end[turn] == true) {
//     turn = (turn + 1) % MAX_PLAYERS;
//     startTurn(newTurn);
//   }
//   if (newTurn) {
//     bot.sendMessage(chatId, `Your turn. Please play a card using play.`);
//     bot.sendMessage(chatId, player.showCards());
//   }
//   newTurn = false;
//   bot.once('message', (msg) => {
//     if (msg.from.id === playerId && msg.text.startsWith('play')) {
//       const card = msg.text.split(' ')[1];
//       if (player.canPlay(card, high)) {
//         cardPlayed = player.play(card);
//         high = cardPlayed.number;
//         broadcastCard(player.username, cardPlayed);
//         if (player.getCardCount() == 1) {
//           broadcastPlayerMsg(player.username, "has one card left")
//         }
//         if (player.getCardCount() == 0) {
//           end[turn] = finishedCount;
//           broadcastPlayerMsg(player.username, "has played their last card")
//           finishedCount++;
//         }
//         turn = (turn + 1) % MAX_PLAYERS;
//         newTurn = true;
//       } else {
//         bot.sendMessage(chatId, "Invalid Action")
//       }
//     } else if (msg.from.id === playerId && msg.text.startsWith('pass')) {
//       high = 0;
//       broadcastPlayerMsg(player.username, " passed");
//       turn = (turn + 1) % MAX_PLAYERS;
//       newTurn = true;
//     } else if (msg.from.id === playerId) {
//       bot.sendMessage(chatId, "Invalid Action")
//     }
//     startTurn(newTurn);
//   });
// }

