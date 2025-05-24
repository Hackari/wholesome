import { User } from 'node-telegram-bot-api';
import { Card } from './card';
import { RoundType, THREE_DIAMONDS, TWO_SPADES } from './constants';
import { Deck } from './deck';
import { Round } from './rounds/round';

const TWO = 12;

export class Player {
    first: boolean = false;
    userId: number;
    username: string;
    idx: number;
    comp: (card1: Card, card2: Card) => number;
    hand: Card[] = [];
		deck: Deck;

    constructor(usr: User, idx: number, deck: Deck) {
        this.userId = usr.id;
        this.username = usr.username as string;
        this.idx = idx;
        this.comp = Card.compareByValueThenSuit;

    		this.deck = deck;
				this.newHand();

        const firstCard = this.hand[0];
        if (firstCard.isCardNumber(THREE_DIAMONDS)) {
            this.first = true;
        }
    }

		newHand() {
			this.hand = this.deck.getHand(this.idx).sort(this.comp);
		}

    showHand() {
        let cardList = "";
        for (let i = 0; i < this.hand.length; i++) {
            cardList += `${i + 1}: ${this.hand[i]}\n`
        }
        return cardList;
    }

    sortHand() {
        let sortMsg = "";
        if (this.comp == Card.compareBySuitThenValue) {
            this.comp = Card.compareByValueThenSuit;
            sortMsg += "Sorting by Value, then by Suit\n";
        } else {
            this.comp = Card.compareBySuitThenValue;

            sortMsg += "Sorting by Suit, then by Value\n";
        }
        this.hand.sort(this.comp);
        sortMsg += this.showHand();
        return sortMsg;
    }

    getCardCount() {
        return this.hand.length;
    }

		hasThreeDiamonds() {
				return this.hand[0].isCardNumber(THREE_DIAMONDS);
		}

		hasTwoSpades() {
			  return this.hand[this.hand.length - 1].isCardNumber(TWO_SPADES);
		}

		hasFourTwos() {
				return this.hand[this.hand.length - 4].rank == TWO;
		}

		isBelowPoints() {
				return this.hand.map(c => c.getPoints()).reduce((a, p) => a + p, 0) <= 6;
		}

    removeCards(cardIndices: number[]) {
        let inputLength = cardIndices.length;
        cardIndices.sort((a, b) => b - a);
        for (let i = 0; i < inputLength; i++) {
            let cardIndex = cardIndices[i] - 1;
            this.hand.splice(cardIndex, 1);
        }
    }

    isAllUnique(list: number[]) {
        return new Set(list).size === list.length;
    }

    playCards(cardIndices: number[], currRoundType: RoundType, high: Round | undefined) {
        let inputLength = cardIndices.length;
        for (let i = 0; i < inputLength; i++) {
            let cardIndex = cardIndices[i]
            if (0 >= cardIndex || cardIndex > this.getCardCount()) {
                return `Invalid card index ${cardIndex} found`;
            }
        }

        if (!this.isAllUnique(cardIndices)) {
            return `You played duplicate cards.`
        }

        const selectedCards = cardIndices.map(cardIndex => this.hand[cardIndex - 1]);
        const playerMove = Round.move(selectedCards);
				const playedRoundType = playerMove.getRoundType();

        if (currRoundType != RoundType.ANY && currRoundType != playedRoundType) {
            return `The current round type is ${currRoundType}. 
            You played ${playedRoundType}.`;
        }

        if (!playerMove.isValid() || !playerMove.canPlay(high)) {
            return `You tried to play ${playerMove.toStringAsHand()}`;
        }

        this.removeCards(cardIndices);
        return playerMove;
    }

    getStatus() {
        let marker = "";
        if (this.first) {
            marker = "!";
        }
        return `${marker}${this.idx + 1}: ${this.username} (${this.getCardCount()} card(s) left)`;
    }
}
