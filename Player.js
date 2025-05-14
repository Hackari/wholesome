const Card = require('./Card'); 

class Player {
    constructor(userId, gameId, username, curr_deck) {
        this.userId = userId;
        this.gameId = gameId;
        this.username = username;
        this.comp = Card.compareBySuitThenValue;

        const startIdx = gameId * 13;
        const endIdx = startIdx + 13;
        this.cards = curr_deck.slice(startIdx, endIdx).sort(this.comp); 
        this.first = false;
        const firstCard = this.cards[0];
        if (firstCard.isCard(0)) {
            this.first = true;
        }
    }

    // Method to display the player's hand
    showCards() {
        let cardList = ""
        const currCards = this.cards.sort(this.comp);
        for (let i = 0; i < currCards.length; i++) {
            cardList += `${i + 1}: ${currCards[i]}\n`
        }
        return cardList;
    }

    swapSort() {
        if (this.comp == Card.compareBySuitThenValue) {
            this.comp = Card.compareByValueThenSuit;
            return "Sorting by Value, then by Suit";
        } else {
            this.comp = Card.compareBySuitThenValue;
            return "Sorting by Suit, then by Value";
        }
    }

    // Method to check the number of cards the player has
    getCardCount() {
        return this.cards.length;
    }

    getStatus() {
        let marker = "";
        if (this.first) {
            marker = "!";
        }
        return `${marker}${this.gameId + 1}: ${this.username} (${this.getCardCount()} card(s) left)`;
    }

    canPlay(card, high) {
        if (card > 0 && card <= this.getCardCount()) {
            const cardToPlay = this.cards[card - 1];
            return cardToPlay.number >= high;
        }
        return false;
    }

    play(card) {
        const cardToPlay = this.cards[card - 1];
        this.cards.splice(card - 1, 1);
        return cardToPlay;
    }
}

module.exports = Player;