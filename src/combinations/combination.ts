import { Card } from '../card';
import { RoundType, SetType } from '../constants';

export abstract class Combination {
	protected weight: number = -1;

	static move(cards: Card[]): Combination {
		switch (cards.length) {
			case 1:
				return new Single(cards);
			case 2:
				return new Pair(cards);
			case 5:
				return new CardSet(cards);
			default:
				return new InvalidCombination();
		}
	}

	canPlay(high: Combination | undefined) {
		return high === undefined || (this.getRoundType() == high.getRoundType() && this.weight > high.weight);
	}

	abstract toString(): string;
	abstract toStringAsHand(): string;
	abstract getRoundType(): RoundType;
	abstract getSetType(): SetType;
	abstract isValid(): boolean;
};

class InvalidCombination extends Combination {
	toString() {
		return 'invalid';
	}

	toStringAsHand() {
		return 'invalid';
	}

	getRoundType() {
		return RoundType.ANY;
	}

	getSetType() {
		return SetType.INVALID;
	}

	isValid() {
		return false;
	}
}

// resolve circular imports
import { CardSet } from './cardset';
import { Pair } from './pair';
import { Single } from './single';
