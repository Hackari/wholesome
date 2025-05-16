class Card {
    constructor(number) {
        this.number = number;

        this.value = Math.floor(number / 4);
        this.suit = number % 4;
    }

    isCard(number) {
        return this.number == number;
    }

    getValue() {
        const values = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
        return values[this.value];  // Return the corresponding value as a string
    }

    getSuit() {
        const suits = ['♦️', '♣️', '♥️', '♠️'];
        return suits[this.suit];
    }

    toString() {
        return `${this.getValue()}${this.getSuit()}`;
    }

    static compareBySuitThenValue(cardA, cardB) {
        if (cardA.suit < cardB.suit) {
            return -1;
        } else if (cardA.suit > cardB.suit) {
            return 1;
        } else {
            return cardA.value - cardB.value;
        }
    }

    static compareByValueThenSuit(cardA, cardB) {
        if (cardA.value < cardB.value) {
            return -1;
        } else if (cardA.value > cardB.value) {
            return 1;
        } else {
            return cardA.suit - cardB.suit;
        }
    }
}

module.exports = Card;