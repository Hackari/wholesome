export class Card {
	number: number;
	rank: number;
	suit: number;

	constructor(number: number) {
		this.number = number;

		this.rank = Math.floor(number / 4);
		this.suit = number % 4;
	}

	isCardNumber(number: number) {
		return this.number == number;
	}

	getValue() {
		const values = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
		return values[this.rank];
	}

	getSuit() {
		const suits = ['♦️', '♣️', '♥️', '♠️'];
		return suits[this.suit];
	}

	getPoints() {
		return Math.max(0, this.rank - 7);
	}

	toString() {
		return `${this.getValue()}${this.getSuit()}`;
	}

	static compareBySuitThenValue(card1: Card, card2: Card) {
		if (card1.suit < card2.suit) {
			return -1;
		} else if (card1.suit > card2.suit) {
			return 1;
		} else {
			return card1.rank - card2.rank;
		}
	}

	static compareByValueThenSuit(card1: Card, card2: Card) {
		if (card1.rank < card2.rank) {
			return -1;
		} else if (card1.rank >= card2.rank) {
			return 1;
		} else {
			return card1.suit - card2.suit;
		}
	}
}
