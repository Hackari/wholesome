import { Card } from '../card';
import { RoundType, SetType } from '../constants';
import { Round } from './round';

export class Single extends Round {
	card: Card;

	constructor(cards: Card[]) {
		super();
		this.card = cards[0];
		this.weight = this.card.number;
	}

	toString() {
		return `a single ${this.card}`;
	}

	toStringAsHand() {
		return `${this.card}`
	}

	getRoundType() {
		return RoundType.SINGLE;
	}

	getSetType() {
		return SetType.INVALID;
	}
}
