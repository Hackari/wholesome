const Card = require('./Card');
const DeckInit = require('./DeckInit');
const Player = require('./Player');

const MAX_PLAYERS = 2;
const ROUND_TYPES = ['Single', 'Pair', 'Set', 'Any'];
const SET_TYPES = ['Straight', 'Flush', 'Full House', 'Straight Flush', 'Royal Flush'];

const SINGLE = 0;
const PAIR = 1;
const SET = 2;
const ANY = 3;

const STRAIGHT = 0;
const FLUSH = 1;
const FULL_HOUSE = 2;
const STRAIGHT_FLUSH = 3;
const ROYAL_FLUSH = 4;

const THREE_DIAMONDS = 0;

class Game {
	static instances = [];

	constructor(chatId, bot) {
		this.players = [];
		this.inversePlayers = [];
		this.playerCount = 0;
		this.turn = MAX_PLAYERS;
		this.currRoundType = ANY;
		this.currSetType = STRAIGHT;
		this.high = new Card(THREE_DIAMONDS);
		this.gameActive = false;

		this.chatId = chatId;
		this.bot = bot;

		this.deckInit = new DeckInit();
		this.deckInit.shuffle();
		console.log(`Created a new game for ${MAX_PLAYERS} players in ${this.chatId.toString(16)}.`);

		Game.instances.push(this); // WARNING: may lead to memory leaks if instances are created and never destroyed
	}

	destroy() { // call destroy on game end
		let i = 0;
		while (Game.instances[i] !== this) { i++; }
		Game.instances.splice(i, 1);
	}

	static getGameByChatId(chatId) {
		return Game.instances.filter(g => g.chatId == chatId)[0];
	}

	message(userId, text) {
		this.bot.sendMessage(userId, text);
	}

	broadcast(text) {
		for (let i = 0; i < this.playerCount; i++) {
			const player = this.players[i];
			this.message(player.userId, text);
		}
		this.message(this.chatId, text);
	}

	isFull() {
		return this.playerCount >= MAX_PLAYERS;
	}

	join(usr) {
		if (!this.isFull()) {
			const newPlayer = new Player(usr, this.playerCount, this.deckInit);
			this.players[this.playerCount] = newPlayer;
			this.inversePlayers[this.playerCount] = usr.id;

			if (newPlayer.first) {
				this.turn = this.playerCount;
				console.log(`Three diamonds found.`);
			}

			this.playerCount++;

			let playerJoinMsg = `${newPlayer.username} joined as player ${this.playerCount}`
			console.log(playerJoinMsg);
			// this.broadcast(playerJoinMsg);

			// if (this.gameIsFull()) {
			//	this.broadcast(`All players found. Starting game.`)
			// }

			return true;
		}
		return false;
	}

	getPlayer(usr) {
		const player = this.players[this.inversePlayers.indexOf(usr.id)];
		return player;
	}

	playerAction(usr, action) {
		const player = this.getPlayer(usr);
		const resultMsg = action(player)
		this.message(player.userId, resultMsg);
	}

	showHand(usr) {
		this.playerAction(usr,
			(player) => player.showHand()
		);
	}

	sortHand(usr) {
		this.playerAction(usr,
			(player) => player.sortHand()
		);
	}

	showStatus(usr) {
		const player = this.getPlayer(usr);
		let statusMsg = `Total players: ${this.playerCount}`
		statusMsg += `Current Round Type: ${ROUND_TYPES[this.currRoundType]}\n`;
		for (let i = 0; i < this.playerCount; i++) {
			const player = this.players[i];
			const playerMsg = player.getStatus();
			statusMsg += playerMsg + "\n";
		}
		this.message(player.userId, statusMsg);
	}

	play(usr, text) {
		const cardIndices = text.split(' ').slice(1);
		this.playerAction(usr,
			(player) => player.playCards(cardIndices,
				this.currRoundType,
				this.currSetType,
				this.high)
		)
	}

}

module.exports = Game;
