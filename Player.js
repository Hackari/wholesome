const Card = require('./Card'); 

const INVALID_ROUND = 4;

class Player {
    constructor(msg, turn, initDeck) {
        this.userId = msg.from.id;
        this.username = msg.from.username;
        this.turn = turn;
        this.comp = Card.compareBySuitThenValue;

        const startIdx = turn * 13;
        const endIdx = startIdx + 13;
        this.hand = initDeck.slice(startIdx, endIdx).sort(this.comp); 

        this.first = false;
        const firstCard = this.hand[0];
        if (firstCard.isCard(0)) {
            this.first = true;
        }
    }

    showHand() {
        let cardList = ""
        const hand = this.hand;
        for (let i = 0; i < this.hand.length; i++) {
            cardList += `${i + 1}: ${this.hand[i]}\n`
        }
        return cardList;
    }

    sortHand() {
        let sortMsg = "";
        if (this.comp == Card.compareBySuitThenValue) {
            this.comp = Card.compareByValueThenSuit;
            sortMsg += "Sorting by Value, then by Suit\n";
        } else {
            this.comp = Card.compareBySuitThenValue;

            sortMsg += "Sorting by Suit, then by Value\n";
        }
        this.hand.sort(this.comp);
        sortMsg += this.showHand();
        return sortMsg;
    }

    getCardCount() {
        return this.hand.length;
    }

    removeCards(cardIndices) {
        for (let i = 0; i < cardIndices.length(); i++) {
            cardIndex = cardIndices[i] -1;
            this.cards.splice(card - 1, 1);
        }
    }

    playCards(cardIndices, currRoundType, currSetType, high) {
        for (let i = 0; i < cardIndices.length(); i++) {
            cardIndex = cardIndices[i]
            if (0 >= cardIndex || cardIndex > this.getCardCount()) {
                // throw error
                return;
            }
        }

        playedRoundType = INVALID_ROUND;

        const selectedCards = cardIndices.map(cardIndex => this.hand[cardIndex - 1]);

        switch (cardIndices.length) {
            case 1:
                playerMove = new Single(...selectedCards);
                playedRoundType = Game.SINGLE;
                break;
            case 2:
                playerMove = new Pair(...selectedCards);
                playedRoundType = Game.PAIR;
                break;
            case 5:
                playerMove = new Set(...selectedCards);
                playedRoundType = Game.SET;
                break;
            default:
                // invalid amount of cards
                return;
        }

        if (currRoundType != playedRoundType) {
            // ask for cards again
            return;
        }
        if (!playerMove.canPlay(currSetType, high)) {
            // ask for cards again
            return;
        }

        this.removeCards(cardIndices);
        return playerMove;
    }

    getStatus() {
        let marker = "";
        if (this.first) {
            marker = "!";
        }
        return `${marker}${this.turn + 1}: ${this.username} (${this.getCardCount()} card(s) left)`;
    }
}

module.exports = Player;