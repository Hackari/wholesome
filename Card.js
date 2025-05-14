class Card {
    constructor(number) {
        this.number = number;
        // Calculate the value and suit based on the card number
        this.value = Math.floor(number / 4);  // Value is floor division by 13
        this.suit = number % 4;  // Suit is modulus 4
    }

    isCard(number) {
        return this.number == number;
    }

    // Method to get the value as a string (e.g., '2', '3', ..., 'A')
    getValue() {
        const values = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
        return values[this.value];  // Return the corresponding value as a string
    }

    // Method to get the suit as a string (e.g., '♦', '♣', '♥', '♠')
    getSuit() {
        const suits = ['♦️', '♣️', '♥️', '♠️'];
        return suits[this.suit];  // Return the corresponding suit as a string
    }

    // Method to represent the card as a string (e.g., '10♠')
    toString() {
        return `${this.getValue()}${this.getSuit()}`;
    }

    static compareBySuitThenValue(cardA, cardB) {
        // First compare suits
        if (cardA.suit < cardB.suit) {
            return -1;  // cardA comes first
        } else if (cardA.suit > cardB.suit) {
            return 1;  // cardB comes first
        } else {
            // If suits are equal, compare by value
            return cardA.value - cardB.value;  // Ascending order
        }
    }

    // Comparator for sorting by value then suit
    static compareByValueThenSuit(cardA, cardB) {
        // First compare values
        if (cardA.value < cardB.value) {
            return -1;  // cardA comes first
        } else if (cardA.value > cardB.value) {
            return 1;  // cardB comes first
        } else {
            // If values are equal, compare by suit
            return cardA.suit - cardB.suit;  // Ascending order
        }
    }
}

module.exports = Card;