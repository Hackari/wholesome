const Card = require('./Card'); 

class DeckInit {
    constructor() {
        this.deck = this.init(); 
    }

    init() {
        const deck = [];
        for (let i = 0; i < 52; i++) {
            deck.push(new Card(i));
        }
        return deck;
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        return this.deck;
    }

    slice(start, end) {
        return this.deck.slice(start, end);
    }
}

module.exports = DeckInit;