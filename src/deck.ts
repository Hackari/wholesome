import { Card } from './card';

export class Deck {
	deck: Card[] = [];
	players: number;

	constructor(players: 1 | 2 | 4) {
		this.players = players;
		for (let i = 0; i < 52; i++) {
			this.deck.push(new Card(i));
		}
		this.shuffle();
	}

	shuffle() {
		for (let i = this.deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
		}
		return this.deck;
	}

	getHand(idx: number) {
		const interval = 52 / this.players;
		const start = idx * interval;
		return this.deck.slice(start, start + interval);
	}
}
