const TelegramBot = require('node-telegram-bot-api');
const Deck = require('./Deck'); 
const Player = require('./Player'); 
const Config = require('./config');
const MAX_PLAYERS = 2;
const bot = new TelegramBot(config.token, { polling: true });
const ROUND_TYPES = ['Single', 'Pair', 'Set', 'Any'];
const SET_TYPES = ['Straight', 'Flush', 'Full House', 'Straight Flush', 'Royal Flush'];
curr_deck = new Deck();
playerLookup = [];
players = [];
player_count = 0;
lobby = 0;
currRoundType = 0;
turn = MAX_PLAYERS;
high = 0;

function getPlayer(msg) {
  const userId = msg.from.id;
  const player = players[playerLookup.indexOf(userId)];
  return player;
}

// Command to start a game
bot.onText(/\/startgame/, (msg) => {
    const chatId = msg.chat.id;
    lobby = chatId;
    curr_deck = new Deck();
    currRoundType = 3;
    high = 0;
    curr_deck.shuffle(); 
    player_count = 0;
    bot.sendMessage(chatId, `Game started! Do /joingame to join!`);
});

bot.onText(/\/joingame/, (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const username = msg.from.username;
  playerLookup[player_count] = userId;
  const player = new Player(userId, player_count, username, curr_deck);
  players[player_count] = player
  if (player.first) {
    turn = player_count;
  }
  player_count++;
  if (player_count >= MAX_PLAYERS) {
    bot.sendMessage(chatId, `Enough players found. Starting game.`);
    startTurn();
  }
})

function startTurn() {
  const playerId = playerLookup[turn];
  const player = players[turn];
  const chatId = playerId;
  bot.sendMessage(chatId, `Your turn. Please play a card using /playcard.`);
  bot.once('message', (msg) => {
    if (msg.from.id === playerId && msg.text.startsWith('/playcard')) {
      const card = msg.text.split(' ')[1];
      if (player.canPlay(card, high)) {
        cardPlayed = player.play(card);
        high = cardPlayed.number;
        bot.sendMessage(lobby, `${player.username} played: ${cardPlayed}`);
        turn = (turn + 1) % MAX_PLAYERS;
      } else {
        bot.sendMessage(chatId, "Invalid Action")
      }
    } else if (msg.from.id === playerId && msg.text.startsWith('/pass')) {
      high = 0;
      bot.sendMessage(lobby, `${player.username} passed`);
      turn = (turn + 1) % MAX_PLAYERS;
    }
    startTurn();
  });
}

bot.onText(/\/showdeck/, (msg) => {
  const chatId = msg.chat.id;
  let deck = "Use this command in private message.";
  if (chatId != lobby) {
    let player = getPlayer(msg);
    deck = player.showCards();
  }
  bot.sendMessage(chatId, deck);
})

bot.onText(/\/sort/, (msg) => {
  const chatId = msg.chat.id;
  let deck = "Use this command in private message.";
  if (chatId != lobby) {
    let player = getPlayer(msg);
    deck = player.swapSort();
  }
  bot.sendMessage(chatId, deck);
})

bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  let statusMsg = `Total players: ${player_count}\n`
  statusMsg += `Current Round Type: ${ROUND_TYPES[currRoundType]}\n`;
  for (let i = 0; i < player_count; i++) {
    const player = players[i];
    const playerMsg = player.getStatus();
    statusMsg += playerMsg + "\n";
  }
  bot.sendMessage(chatId, statusMsg);
})
