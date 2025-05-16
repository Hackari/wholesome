const TelegramBot = require('node-telegram-bot-api');
const Config = require('./Config');
const Game = require('./Game');
const MAX_PLAYERS = 1;
const bot = new TelegramBot(Config.token, { polling: true });
// const ROUND_TYPES = ['Single', 'Pair', 'Set', 'Any'];
// const SET_TYPES = ['Straight', 'Flush', 'Full House', 'Straight Flush', 'Royal Flush'];
// curr_deck = new DeckInit();
// playerLookup = [];
// players = [];
// end = [];
// finishedCount = 0;
// player_count = 0;
// currRoundType = 0;
// turn = MAX_PLAYERS;
// high = 0;

let game = 0;

// function getPlayer(msg) {
//   const userId = msg.from.id;
//   const player = players[playerLookup.indexOf(userId)];
//   return player;
// }

// Command to start a game
bot.onText(/\/start/, (msg) => {
  const lobby = msg.chat.id;
  game = new Game(lobby, bot);
    // curr_deck = new Deck();
    // currRoundType = 3;
    // high = 0;
    // curr_deck.shuffle(); 
    // player_count = 0;
    // end = [false, false, false, false];
    // finishedCount = 0;
  bot.sendMessage(lobby, `Game started! Do /join to join!`);
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

// bot.onText(/status/, (msg) => {
//   const chatId = msg.chat.id;
//   let statusMsg = `Total players: ${player_count}\n`
//   statusMsg += `Current Round Type: ${ROUND_TYPES[currRoundType]}\n`;
//   for (let i = 0; i < player_count; i++) {
//     const player = players[i];
//     const playerMsg = player.getStatus();
//     statusMsg += playerMsg + "\n";
//   }
//   bot.sendMessage(chatId, statusMsg);


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


// })
