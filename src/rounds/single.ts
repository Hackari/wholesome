import { Card } from '../card';
import { SINGLE, STRAIGHT } from '../constants';
import { Round } from './round';

export class Single implements Round {
    card: Card;
    
    weight: number;

    constructor(cards: Card[]) {
        this.card = cards[0];
        this.weight = this.card.number;
    }

    canPlay(currSetType: number, high: Single | undefined) {
        return high === undefined || this.weight > high.weight;
    }

    toString() {
        return `a single ${this.card}`;
    }

    toStringAsHand() {
        return `${this.card}`
    }

    getHighest() {
        return this.card;
    }

    getRoundType() {
        return SINGLE;
    }

    getSetType() {
        return STRAIGHT;
    }
}