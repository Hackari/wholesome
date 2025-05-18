const Card = require('./Card');
const DeckInit = require('./DeckInit');
const Player = require('./Player');

const MAX_PLAYERS = 2;

const {
	ROUND_TYPES,
	ANY,
	STRAIGHT,
	THREE_DIAMONDS, 
	FORCE_START,
	SET,
	SET_TYPES
} = require('./Constants');
const { useDeferredValue } = require('react');

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
		this.isActive = false;
		this.endMsg = "";
		this.passCount = 0;
		this.endCount = 0;

		this.chatId = chatId;
		this.bot = bot;

		this.deckInit = new DeckInit();
		this.deckInit.shuffle();

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

	static getGameByUserId(userId) {
		return Game.instances.filter(g => g.inversePlayers.includes(userId))[0];
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
			} else if (this.playerCount === 0 && FORCE_START) {
				this.turn = this.playerCount;
			}

			this.playerCount++;

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
		let statusMsg = `Total players: ${this.playerCount}\n`
		statusMsg += `Current Round Type: ${ROUND_TYPES[this.currRoundType]}\n`;
		if (this.currRoundType == SET) {
			statusMsg += `Current Set Type: ${SET_TYPES[this.currSetType]}\n`;
		}
		statusMsg += `Current Turn: ${this.players[this.turn].username}\n`;
		statusMsg += `Current High: ${this.high}\n`;

		for (let i = 0; i < this.playerCount; i++) {
			const player = this.players[i];
			const playerMsg = player.getStatus();
			statusMsg += playerMsg + "\n";
		}
		this.message(player.userId, statusMsg);
	}

	pingCurrentPlayer() {
		let player = this.players[this.turn];
		let pingMsg = "It is now your turn!\n"
		pingMsg += player.showHand();
		this.message(player.userId, pingMsg);
	}

	isPlayerTurn(player) {
		return player.turn == this.turn;
	}

	nextTurn() {
		let player = this.players[this.turn];
		let count = 0;
		do {
			this.turn = (this.turn + 1) % MAX_PLAYERS;
			player = this.players[this.turn];
			count++;
		} while (count <= MAX_PLAYERS && player.getCardCount() == 0);

		if (count > MAX_PLAYERS) {
			this.endGame();
			return;
		}

		this.pingCurrentPlayer();
	}

	reset() {
		this.high = new Card(THREE_DIAMONDS);
		this.currRoundType = ANY;
		this.currSetType = STRAIGHT;
	}

	pass(usr) {
		const player = this.getPlayer(usr);
		if (!this.isPlayerTurn(player)) {
			this.message(player.userId, "It is not your turn.")
			return;
		}
		this.broadcast(`${player.username} passed`);
		this.passCount++;
		if (this.passCount >= (MAX_PLAYERS - this.endCount)) {
			this.broadcast(`Resetting playing field.`);
			this.reset();
			this.passCount = 0;
		}
		this.nextTurn();
	}

	play(usr, text) {
		const cardIndices = text.split(' ').slice(1);
		const player = this.getPlayer(usr);
		if (!this.isPlayerTurn(player)) {
			this.message(player.userId, "It is not your turn.")
			return;
		}
		const resultMsg = player.playCards(cardIndices,
				this.currRoundType,
				this.currSetType,
				this.high)
		
		if (player.getCardCount() == 1) {
			this.broadcast(`${player.username} has one card remaining.`);
		}

		if (typeof resultMsg === 'string') {
			this.message(player.userId, resultMsg);
		} else {
			this.high = resultMsg.getHighest();
			this.currRoundType = resultMsg.getRoundType();
			this.currSetType = resultMsg.getSetType();
			this.broadcast(`${player.username} played ${resultMsg}`);
			this.nextTurn();
		}

		if (player.getCardCount() == 0) {
			this.broadcast(`${player.username} has ended.`);
			this.endMsg += `${player.username}\n`
			this.endCount++;
			this.reset();
		}
	}

	endGame() {
		this.broadcast(`Game Standings:\n${this.endMsg}`);
		this.destroy(); // Is this correct? @Alieron
	}
}

module.exports = Game;
