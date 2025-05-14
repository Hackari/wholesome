const Card = require('./Card'); 

class Deck {
    constructor() {
        this.deck = this.init();  // Initialize the deck when a new object is created
    }

    // Method to initialize the deck with 52 cards
    init() {
        const deck = [];
        for (let i = 0; i < 52; i++) {
            deck.push(new Card(i));
        }
        return deck;
    }

    // Method to shuffle the deck using Fisher-Yates algorithm
    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]; // Swap the elements
        }
        return this.deck;
    }

    slice(start, end) {
        return this.deck.slice(start, end);
    }
}

module.exports = Deck;