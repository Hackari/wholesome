import { Card } from '../card';
import { RoundType, SetType } from '../constants';
import { Combination } from './combination';

const ACE = 11;
const TWO = 12;
const THREE = 0;
const FOUR = 1;
const FIVE = 2;
const SIX = 3;
const TEN = 7;
const KING = 10;
const SET_TYPES = ['Invalid', 'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush', 'Royal Flush'];
const SET_WEIGHT = 100;
const RANKS_PER_SUIT = 13;

export class CardSet extends Combination {
	card1: Card;
	card2: Card;
	card3: Card;
	card4: Card;
	card5: Card;
	setType: SetType = SetType.INVALID;

	constructor(cards: Card[]) {
		super();
		const sorted = [...cards].sort(Card.compareByValueThenSuit);
		this.card1 = sorted[0];
		this.card2 = sorted[1];
		this.card3 = sorted[2];
		this.card4 = sorted[3];
		this.card5 = sorted[4];

		const flushWeight = this.getFlushWeight();
		const straightWeight = this.getStraightWeight();
		if (flushWeight !== undefined && this.isRoyal()) {
			this.setType = SetType.ROYAL_FLUSH;
			this.weight = this.getSetWeight(this.setType, this.card1.suit);
			return;
		}
		if (flushWeight !== undefined && straightWeight !== undefined) {
			this.setType = SetType.STRAIGHT_FLUSH;
			this.weight = this.getSetWeight(this.setType, this.card1.suit * RANKS_PER_SUIT + this.getStraightHighRank());
			return;
		}

		const fourOfAKindWeight = this.getFourOfAKindWeight();
		if (fourOfAKindWeight !== undefined) {
			this.setType = SetType.FOUR_OF_KIND;
			this.weight = this.getSetWeight(this.setType, fourOfAKindWeight);
			return;
		}

		const fullHouseWeight = this.getFullHouseWeight();
		if (fullHouseWeight !== undefined) {
			this.setType = SetType.FULL_HOUSE;
			this.weight = this.getSetWeight(this.setType, fullHouseWeight);
			return;
		}

		if (flushWeight !== undefined) {
			this.setType = SetType.FLUSH;
			this.weight = this.getSetWeight(this.setType, flushWeight);
			return;
		}
		if (straightWeight !== undefined) {
			this.setType = SetType.STRAIGHT;
			this.weight = this.getSetWeight(this.setType, straightWeight);
		}
	}

	static genSets(hand: Card[]) {
		const result: Card[][] = [];
		const current: Card[] = [];
		const n = hand.length;

		function combination(idx: number, final: number, r: number) {
			if (current.length === final) { // end case
				result.push([...current]);
				return;
			}
			for (let i = idx; i < n - r + 1; i++) {
				current.push(hand[i]);
				combination(i + 1, final, r - 1);
				current.pop();
			}
		}

		combination(0, 5, 5); // 5-combinations of the hand, at most 13C5 = 1287
		return result.map(a => new CardSet(a)).filter(s => s.getSetType() !== SetType.INVALID);
	}

	isFlush() {
		return this.getFlushWeight() !== undefined;
	}

	private getFlushWeight() {
		const suit = this.card1.suit;
		if (
			this.card2.suit === suit &&
			this.card3.suit === suit &&
			this.card4.suit === suit &&
			this.card5.suit === suit
		) {
			return suit * RANKS_PER_SUIT + this.card5.rank;
		}
		return undefined;
	}

	isStraight() {
		return this.getStraightWeight() !== undefined;
	}

	private getStraightWeight() {
		const v1 = this.card1.rank;
		const v2 = this.card2.rank;
		const v3 = this.card3.rank;
		const v4 = this.card4.rank;
		const v5 = this.card5.rank;

		if (v2 === v1 + 1 && v3 === v2 + 1 && v4 === v3 + 1 && v5 === v4 + 1) {
			return this.card5.number;
		}
		if (v5 === TWO) {
			// special case: A 2 3 4 5
			if (v4 == ACE && v1 == THREE && v2 == FOUR && v3 == FIVE) {
				return this.card3.number;
			}
			// special case: 2 3 4 5 6
			if (v1 == THREE && v2 == FOUR && v3 == FIVE && v4 == SIX) {
				return this.card4.number;
			}
		}
		return undefined;
	}

	isFullHouse() {
		return this.getFullHouseWeight() !== undefined;
	}

	private getFullHouseWeight() {
		const v1 = this.card1.rank;
		const v2 = this.card2.rank;
		const v3 = this.card3.rank;
		const v4 = this.card4.rank;
		const v5 = this.card5.rank;

		if ((v1 === v3) && (v4 === v5)) {
			return v1;
		}
		if ((v1 === v2) && (v3 === v5)) {
			return v5;
		}
		return undefined;
	}

	isFourOfAKind() {
		return this.getFourOfAKindWeight() !== undefined;
	}

	private getFourOfAKindWeight() {
		const v1 = this.card1.rank;
		const v2 = this.card2.rank;
		const v4 = this.card4.rank;
		const v5 = this.card5.rank;

		if (v1 === v4) {
			return v1;
		}
		if (v2 === v5) {
			return v5;
		}
		return undefined;
	}

	private isRoyal() {
		return this.card1.rank === TEN &&
			this.card2.rank === TEN + 1 &&
			this.card3.rank === TEN + 2 &&
			this.card4.rank === KING &&
			this.card5.rank === ACE;
	}

	private getStraightHighRank() {
		if (this.card5.rank === TWO && this.card4.rank === ACE) {
			return FIVE;
		}
		if (this.card5.rank === TWO) {
			return SIX;
		}
		return this.card5.rank;
	}

	private getSetWeight(setType: SetType, value: number) {
		return setType * SET_WEIGHT + value;
	}

	toString() {
		return `a ${SET_TYPES[this.setType]} of ${this.card1}, ${this.card2}, ${this.card3}, ${this.card4}, and ${this.card5}`;
	}

	toStringAsHand() {
		return `${this.card1}, ${this.card2}, ${this.card3}, ${this.card4}, and ${this.card5}`;
	}

	getRoundType() {
		return RoundType.SET;
	}

	getSetType() {
		return this.setType;
	}

	isValid() {
		return this.setType !== SetType.INVALID;
	}
}
