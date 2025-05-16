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
    constructor(lobby, bot) {
        this.players = [];
        this.inversePlayers = [];
        this.playerCount = 0;
        this.turn = MAX_PLAYERS;
        this.currRoundType = ANY;
        this.currSetType = STRAIGHT;
        this.high = new Card(THREE_DIAMONDS);
        this.gameActive = false;

        this.lobby = lobby;
        this.bot = bot;

        this.deckInit = new DeckInit();
        this.deckInit.shuffle();
        console.log(`Created a new game for ${MAX_PLAYERS} players.`);
    }

    message(userId, text) {
        this.bot.sendMessage(userId, text);
    }

    broadcast(text) {
        for (let i = 0; i < this.playerCount; i++) {
            const player = this.players[i];
            this.message(player.userId, text);
        }
        this.message(this.lobby, text);
    }

    join(usr) {
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
        this.broadcast(playerJoinMsg);

        if (this.playerCount >= MAX_PLAYERS) {
            this.broadcast(`All players found. Starting game.`)
        }
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
