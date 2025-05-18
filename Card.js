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

    static compareBySuitThenValue(card1, card2) {
        if (card1.suit < card2.suit) {
            return -1;
        } else if (card1.suit > card2.suit) {
            return 1;
        } else {
            return card1.value - card2.value;
        }
    }

    static compareByValueThenSuit(card1, card2) {
        if (card1.value < card2.value) {
            return -1;
        } else if (card1.value >= card2.value) {
            return 1;
        } else {
            return card1.suit - card2.suit;
        }
    }
}

module.exports = Card;