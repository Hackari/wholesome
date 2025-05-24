import { Card } from '../card';
import { RoundType, SetType } from '../constants';
import { Combination } from './combination';

export class Pair extends Combination {
	card1: Card;
	card2: Card;

	constructor(cards: Card[]) {
		super();
		let card1 = cards[0];
		let card2 = cards[1];
		if (card1.number < card2.number) {
			this.card1 = card1;
			this.card2 = card2;
		} else {
			this.card2 = card1;
			this.card1 = card2;
		}
		this.weight = this.card2.number;
	}

	static genPairs(hand: Card[]) {
		let pairs: Pair[] = [];
		const n = hand.length;
		for (let i = 0; i < n; i++) { // loop will not run if hand is empty
			const target = hand.shift() as Card; // hand should not contain undefined
			const matching = hand.filter(c => c.number == target.number);
			if (matching.length > 0) {
				pairs.push(...matching.map(c => new Pair([c, target])));
			}
		}
		return pairs;
	}

	toString() {
		return `a pair of ${this.card1} and ${this.card2}`;
	}

	toStringAsHand() {
		return `${this.card1} and ${this.card2}`;
	}

	getRoundType() {
		return RoundType.PAIR;
	}

	getSetType() {
		return SetType.INVALID;
	}

	isValid() {
		return this.card1.rank == this.card2.rank;
	}
}
