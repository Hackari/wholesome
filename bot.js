const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.js');
const Game = require('./Game.js');

const bot = new TelegramBot(config.token, { polling: true });

let game = 0;

// Start
bot.onText(/\/start/, (msg) => {
	const lobby = msg.chat.id;
	game = new Game(lobby, bot);
	bot.sendMessage(lobby, `Game started!`, {
		reply_markup: { inline_keyboard: [[{ text: 'Join', callback_data: 'join_game' }]] }
	});
	game.join(msg);
});

// Handle callbacks
bot.on('callback_query', (query) => {
	const callback_data = query.data;
	if (callback_data == "join_game") {
game.join({from: query.from})} // scuffed
	});

bot.onText(/\/join/, (msg) => {
	game.join(msg);
})

bot.onText(/hand/, (msg) => {
	game.showHand(msg);
})

bot.onText(/sort/, (msg) => {
	game.sortHand(msg);
})

bot.onText(/status/, (msg) => {
	game.showStatus(msg);
})

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

