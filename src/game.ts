import TelegramBot, { User, Message, SendMessageOptions } from 'node-telegram-bot-api';
import { RoundType, FORCE_START } from './constants';
import { Deck } from './deck';
import { Player } from './player';
import { Combination } from './combinations/combination';

const MAX_PLAYERS = 1;


export class Game {
	static instances: Game[] = [];

	bot: TelegramBot;
	chatId: number;
	players: Player[] = [];
	playerIds: number[] = [];
	playerCount: number = 0;
	turn: number = MAX_PLAYERS;
	currRoundType: RoundType = RoundType.ANY;
	high: Combination | undefined = undefined;
	isActive: boolean = false;
	endMsg: string = "";
	passCount: number = 0;
	endCount: number = 0;
	deck: Deck;
	gameId: bigint;

	constructor(chatId: number, bot: TelegramBot) {
		this.chatId = chatId;
		this.bot = bot;
		this.gameId = BigInt.asUintN(64, BigInt(this.chatId));

		this.deck = new Deck(); // 2 for testing, 4 for game

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
		return Game.instances.filter(g => g.playerIds.includes(userId))[0];
	}

	log(text: string) {
		console.log(`${this.gameId.toString(16)}: ${text}`);
	}

	message(userId: number, text: string, opts?: SendMessageOptions) {
		this.bot.sendMessage(userId, text, opts);
	}

	messagePlayers(text: string, opts?: SendMessageOptions) {
		this.players.forEach(p => this.message(p.userId, text, opts));
	}

	broadcast(text: string) {
		this.message(this.chatId, text);
		this.messagePlayers(text);
	}

	isFull() {
		return this.playerCount >= MAX_PLAYERS;
	}

	addPlayer(usr: User) {
		if (!this.isFull() && !this.playerIds.includes(usr.id)) {
			this.log(`Player ${usr.username} joins`);
			const newPlayer = new Player(usr, this.playerCount, this.deck);
			this.players[this.playerCount] = newPlayer;
			this.playerIds[this.playerCount] = usr.id;


			this.playerCount++;

			return true;
		}
		return false;
	}

	start(usr: User) {
		this.log('Game started');
		this.addPlayer(usr);
		this.message(this.chatId, `Game created! 1/${MAX_PLAYERS}\n- ${usr.username}`, {
			reply_markup: { inline_keyboard: [[{ text: 'Join', callback_data: 'join_game' }]] }
		});
	}

	async join(usr: User, msg: Message) {
		const opts = { chat_id: this.chatId, message_id: msg.message_id };
		if (this.addPlayer(usr)) {
			await this.bot.editMessageText(`${msg.text?.substring(0, 14)}${this.playerCount}${msg.text?.substring(14 + 1)}\n- ${usr.username}`, opts);
			if (!this.isFull()) {
				await this.bot.editMessageReplyMarkup({ inline_keyboard: [[{ text: 'Join', callback_data: 'join_game' }]] }, opts); // options are removed unless readded
			}
		}
		if (this.isFull()) {
			this.message(this.chatId, 'All players found.\nStarting game...');
			this.isActive = true;
			this.checkReshuffle();
		}
	}

	getPlayer(usr: User) {
		const player = this.players[this.playerIds.indexOf(usr.id)];
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
		statusMsg += `Current Round Type: ${this.currRoundType}\n`;
		if (this.currRoundType == RoundType.SET) {
			statusMsg += `Current Set Type: ${this.high?.getSetType()}\n`;
		}
		statusMsg += `Current Turn: ${this.players[this.turn].username}\n`;
		statusMsg += `Current High: ${this.high?.toString()}\n`;

		for (let i = 0; i < this.playerCount; i++) {
			const player = this.players[i];
			const playerMsg = player.getStatus();
			statusMsg += playerMsg + "\n";
		}
		this.message(player.userId, statusMsg);
	}

	currentPlayerTurn() {
		let player = this.players[this.turn];
		this.log(`Player ${player.username}'s turn`);
		let pingMsg = "It is now your turn!\n"
		pingMsg += player.showHand();
		this.message(player.userId, pingMsg, {
			reply_markup: {
				keyboard: [
					[{ text: "1" }, { text: "2" }, { text: "3" }],
					[{ text: "4" }, { text: "5" }, { text: "6" }],
					[{ text: "7" }, { text: "8" }, { text: "9" }],
					[{ text: "10" }, { text: "11" }, { text: "12" }],
					[{ text: "13" }, { text: "play" }, { text: "pass" }]
				]
			}
		});
	}

	isPlayerTurn(player: Player) {
		return player.idx == this.turn;
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

		this.currentPlayerTurn();
	}

	reset() {
		this.log('Reset');
		this.high = undefined;
		this.currRoundType = RoundType.ANY;
	}

	reshuffle() {
		this.deck.shuffle();
		this.players.forEach(p => p.newHand());
	}

	checkReshuffle() {
		if (this.players.some(p => p.hasFourTwos())) {
			this.log('Reshuffling... (4 twos)');
			this.reshuffle();
			this.checkReshuffle();
		} else {
			this.players.forEach(p => this.message(p.userId,
				`Your hand:\n${p.showHand()}\nReshuffle?`, {
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "Yes", callback_data: "reshuffle_yes" },
							{ text: "No", callback_data: "reshuffle_no" }
						]
					]
				}
			}));
		}
	}

	votes: number = 0;
	yesVotes: Player[] = [];

	voteReshuffle(usr: User, msg: Message, vote: string) {
		this.log(`Player ${usr.username} voted ${vote} to reshuffle`);
		this.bot.deleteMessage(usr.id, msg.message_id);

		this.votes++;
		if (vote == "yes") {
			this.yesVotes.push(this.getPlayer(usr));
		}

		if (this.votes === MAX_PLAYERS) {
			if (this.yesVotes.length >= (MAX_PLAYERS === 1 ? 1 : MAX_PLAYERS - 1) || this.yesVotes.some(p => p.isBelowPoints())) {
				this.votes = 0;
				this.yesVotes = [];
				this.log('Reshuffling... (by voting)');
				this.reshuffle(); // reshuffle once more
				this.checkReshuffle(); // check again
			} else {
				this.turn = this.players.map(p => p.hasThreeDiamonds()).indexOf(true);
				this.broadcast(`${this.players[this.turn].username} starts.`)
				this.currentPlayerTurn(); // start game
			}
		}
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

	play(usr: User, cards: string[] | undefined) {
		if (cards === undefined) {
			this.message(usr.id, "Choose something to play");
		} else {
			const cardIndices = cards.map(i => parseInt(i, 10));
			const player = this.getPlayer(usr);
			if (!this.isPlayerTurn(player)) {
				this.message(player.userId, "It is not your turn.")
				return;
			}
			if (player.hasThreeDiamonds() && !cards.includes('1')) {
				this.message(player.userId, "Start with the 3 of Diamonds"); // there has to be a more elegant solution
				return;
			}
			const resultMsg = player.playCards(cardIndices,
				this.currRoundType,
				this.high)

			if (player.getCardCount() == 1) {
				this.broadcast(`${player.username} has one card remaining.`);
			}

			if (typeof resultMsg === 'string') {
				this.message(player.userId, resultMsg);
			} else {
				this.high = resultMsg;
				this.currRoundType = resultMsg.getRoundType();
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
	}

	endGame() {
		this.log('Game ended');
		this.broadcast(`Game Standings:\n${this.endMsg}`);
		this.destroy();
	}
}
