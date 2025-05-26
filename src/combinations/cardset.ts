import { Card } from '../card';
import { RoundType, SetType } from '../constants';
import { Combination } from './combination';

const ACE = 11;
const TWO = 12;
const THREE = 0;
const FOUR = 1;
const FIVE = 2;
const SIX = 3;
const SET_TYPES = ['Invalid', 'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush'];

export class CardSet extends Combination {
	card1: Card;
	card2: Card;
	card3: Card;
	card4: Card;
	card5: Card;
	setType: SetType = SetType.INVALID;

	constructor(cards: Card[]) {
		super();
		cards.sort(Card.compareByValueThenSuit);
		this.card1 = cards[0];
		this.card2 = cards[1];
		this.card3 = cards[2];
		this.card4 = cards[3];
		this.card5 = cards[4];

		if (this.isFourOfAKind()) {
			this.setType = SetType.FOUR_OF_KIND;
		}
		if (this.isFullHouse()) {
			this.setType = SetType.FULL_HOUSE;
		}
		if (this.isFlush()) {
			if (this.isStraight()) {
				this.setType = SetType.STRAIGHT_FLUSH;
			} else {
				this.setType = SetType.FLUSH;
			}
		} else if (this.isStraight()) {
			this.setType = SetType.STRAIGHT;
		}
		this.weight += this.setType * 100;
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
		const suit = this.card1.suit;
		if (
			this.card2.suit === suit &&
			this.card3.suit === suit &&
			this.card4.suit === suit &&
			this.card5.suit === suit
		) {
			this.weight = this.card5.number;
			return true
		}
		return false;
	}

	isStraight() {
		// weird rule of comparing by overlap is impractical to implement right now
		const v1 = this.card1.rank;
		const v2 = this.card2.rank;
		const v3 = this.card3.rank;
		const v4 = this.card4.rank;
		const v5 = this.card5.rank;

		if (v2 === v1 + 1 && v3 === v2 + 1 && v4 === v3 + 1 && v5 === v4 + 1) {
			this.weight = this.card5.number; // rank then suit 
			return true;
		}
		if (v5 === TWO) {
			// special case: A 2 3 4 5
			if (v4 == ACE && v1 == THREE && v2 == FOUR && v3 == FIVE) {
				this.weight = this.card3.number;
				return true;
			}
			// special case: 2 3 4 5 6
			if (v1 == THREE && v2 == FOUR && v3 == FIVE && v4 == SIX) {
				this.weight = this.card4.number;
				return true;
			}
		}
		return false
	}

	isFullHouse() {
		const v1 = this.card1.rank;
		const v2 = this.card2.rank;
		const v3 = this.card3.rank;
		const v4 = this.card4.rank;
		const v5 = this.card5.rank;

		if ((v1 === v3) && (v4 === v5)) {
			this.weight = v1;
			return true;
		}
		if ((v1 === v2) && (v3 === v5)) {
			this.weight = v5;
			return true;
		}
		return false;
	}

	isFourOfAKind() {
		const v1 = this.card1.rank;
		const v2 = this.card2.rank;
		const v4 = this.card4.rank;
		const v5 = this.card5.rank;

		if (v1 === v4) {
			this.weight = v1;
			return true;
		}
		if (v2 === v5) {
			this.weight = v5;
			return true;
		}
		return false;
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
