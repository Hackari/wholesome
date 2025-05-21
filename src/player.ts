import { User } from 'node-telegram-bot-api';
import { Card } from './card';
import { RoundType, SetType, THREE_DIAMONDS } from './constants';
import { Deck } from './deck';
import { CardSet } from './rounds/cardset';
import { Pair } from './rounds/pair';
import { Single } from './rounds/single';
import { Round } from './rounds/round';

export class Player {
    first: boolean = false;
    userId: number;
    username: string;
    turn: number;
    comp: (card1: Card, card2: Card) => number;
    hand: Card[];

    constructor(usr: User, turn: number, initDeck: Deck) {
        this.userId = usr.id;
        this.username = usr.username as string;
        this.turn = turn;
        this.comp = Card.compareByValueThenSuit;

        const startIdx = this.turn * 13;
        const endIdx = startIdx + 13;
        this.hand = initDeck.slice(startIdx, endIdx).sort(this.comp); 

        const firstCard = this.hand[0];
        if (firstCard.isCard(THREE_DIAMONDS)) {
            this.first = true;
        }
    }

    showHand() {
        let cardList = "";
        const hand = this.hand;
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

    playCards<T extends Round>(cardIndices: number[], currRoundType: RoundType, currSetType: SetType, high: T | undefined) {
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

        let playedRoundType: RoundType;
        let playerMove: Round;
        const selectedCards = cardIndices.map(cardIndex => this.hand[cardIndex - 1]);
        switch (inputLength) {
            case 1:
                playerMove = new Single(selectedCards);
                playedRoundType = RoundType.SINGLE;
                break;
            case 2:
                playerMove = new Pair(selectedCards);
                playedRoundType = RoundType.PAIR;
                break;
            case 5:
                playerMove = new CardSet(selectedCards);
                playedRoundType = RoundType.SET;
                break;
            default:
                return "Invalid amount of cards";
        }

        if (currRoundType != RoundType.ANY && currRoundType != playedRoundType) {
            return `The current round type is ${currRoundType}. 
            You played ${playedRoundType}.`;
        }

        if (!(playerMove.canPlay(high))) {
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
        return `${marker}${this.turn + 1}: ${this.username} (${this.getCardCount()} card(s) left)`;
    }
}
