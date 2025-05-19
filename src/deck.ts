import { Card } from './card';

export class Deck {
    deck: Card[];

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

    slice(start: number, end: number) {
        return this.deck.slice(start, end);
    }
}