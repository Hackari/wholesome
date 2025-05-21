import { Card } from '../card';
import { RoundType, SetType } from '../constants';
import { Round } from './round';

export class Single implements Round {
    card: Card;
    
    weight: number;

    constructor(cards: Card[]) {
        this.card = cards[0];
        this.weight = this.card.number;
    }

    canPlay(currSetType: SetType, high: Single | undefined) {
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
        return RoundType.SINGLE;
    }

    getSetType() {
        return SetType.STRAIGHT;
    }
}