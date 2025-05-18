import { Card } from '../card';

import { SINGLE, STRAIGHT } from '../constants';

export class Single {
    card: Card;
    
    constructor(card: Card) {
        this.card = card;
    }

    canPlay(currSetType: number, high: Card) {
        let isHigher = this.card.number >= high.number;
        return isHigher;
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