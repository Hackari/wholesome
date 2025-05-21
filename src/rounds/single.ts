import { Card } from '../card';
import { SINGLE, STRAIGHT } from '../constants';

export class Single {
    card: Card;
    
    constructor(card: Card) {
        this.card = card;
    }

    canPlay(high: Card | undefined) {
        return high === undefined || this.card.number > high.number;
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