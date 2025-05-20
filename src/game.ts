import TelegramBot, { User, Message, InlineKeyboardMarkup, SendMessageOptions } from 'node-telegram-bot-api';
import { Card } from './card';
import { ANY, FORCE_START, ROUND_TYPES, SET, SET_TYPES, STRAIGHT, THREE_DIAMONDS } from './constants';
import { Deck } from './deck';
import { Player } from './player';

const MAX_PLAYERS = 2;


export class Game {
	static instances: Game[] = [];

	bot: TelegramBot;
	chatId: number;
	players: Player[] = [];
	inversePlayers: number[] = [];
	playerCount: number = 0;
	turn: number = MAX_PLAYERS;
	currRoundType: number = ANY;
	currSetType: number = STRAIGHT;
	high: Card = new Card(THREE_DIAMONDS);
	isActive: boolean = false;
	endMsg: string = "";
	passCount: number = 0;
	endCount: number = 0;
	deck: Deck;

	constructor(chatId: number, bot: TelegramBot) {
		this.chatId = chatId;
		this.bot = bot;

		this.deck = new Deck();
		this.deck.shuffle();

		Game.instances.push(this); // WARNING: may lead to memory leaks if instances are created and never destroyed
	}

	destroy() { // call destroy on game end
		let i = 0;
		while (Game.instances[i] !== this) { i++; }
		Game.instances.splice(i, 1);
	}

	static getGameByChatId(chatId: number) {
		return Game.instances.filter(g => g.chatId == chatId)[0];
	}

	static getGameByUserId(userId: number) {
		return Game.instances.filter(g => g.inversePlayers.includes(userId))[0];
	}

	message(userId: number, text: string, opts?: SendMessageOptions) {
		this.bot.sendMessage(userId, text, opts);
	}

	broadcast(text: string) {
		for (let i = 0; i < this.playerCount; i++) {
			const player = this.players[i];
			this.message(player.userId, text);
		}
		this.message(this.chatId, text);
	}

	isFull() {
		return this.playerCount >= MAX_PLAYERS;
	}

	addPlayer(usr: User) {
		if (!this.isFull()) {
			const newPlayer = new Player(usr, this.playerCount, this.deck);
			this.players[this.playerCount] = newPlayer;
			this.inversePlayers[this.playerCount] = usr.id;

			if (newPlayer.first) {
				this.turn = this.playerCount;
			} else if (this.playerCount === 0 && FORCE_START) {
				this.turn = this.playerCount;
			}

			this.playerCount++;
		}
	}

	start(usr: User) {
		this.addPlayer(usr);
		this.message(this.chatId, `Game created! 1/${MAX_PLAYERS}\n- ${usr.username}`, {
			reply_markup: {
				inline_keyboard: [
					[{ text: 'Join', callback_data: 'join_game' }]]
			}
		});
	}

	join(usr: User, msg: Message) {
		this.addPlayer(usr);

		const opts = { chat_id: this.chatId, message_id: msg.message_id };
		this.bot.editMessageText(`${msg.text?.substring(0, 14)}${this.playerCount}${msg.text?.substring(14 + 1)}\n- ${usr.username}`, opts);
		if (this.isFull()) {
			this.bot.editMessageReplyMarkup({} as InlineKeyboardMarkup, opts).catch(() => { }); // remove button
			this.message(this.chatId, `All players found.\nStarting game.`);
			this.isActive = true;
			this.pingCurrentPlayer();
		}
	}

	getPlayer(usr: User) {
		const player = this.players[this.inversePlayers.indexOf(usr.id)];
		return player;
	}

	playerAction(usr: User, action: (player: Player) => string) {
		const player = this.getPlayer(usr);
		const resultMsg = action(player)
		this.message(player.userId, resultMsg);
	}

	showHand(usr: User) {
		this.playerAction(usr,
			(player) => player.showHand()
		);
	}

	sortHand(usr: User) {
		this.playerAction(usr,
			(player) => player.sortHand()
		);
	}

	showStatus(usr: User) {
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

	isPlayerTurn(player: Player) {
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

	pass(usr: User) {
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

	play(usr: User, text: string) {
		const cardIndices = text.split(' ').slice(1).map(s => parseInt(s, 10));
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
