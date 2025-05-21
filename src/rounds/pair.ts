import { Card } from '../card';
import { RoundType, SetType } from '../constants';
import { Round } from './round';

export class Pair implements Round {
    card1: Card;
    card2: Card;

    weight: number;

    constructor(selectedCards: Card[]) {
        let card1 = selectedCards[0];
        let card2 = selectedCards[1];
        if (card1.number > card2.number) {
            this.card1 = card1;
            this.card2 = card2;
        } else {
            this.card2 = card1;
            this.card1 = card2;
        }
        this.weight = card1.number;
    }

    static genPairs(hand: Card[]) {
        let pairs: Pair[] = [];
        const n = hand.length;
        for (let i = 0; i < n; i++) { // loop will not run if hand is empty
            const target = hand.shift() as Card; // hand should not contain undefined
            const matching = hand.filter(c => c.number == target.number);
            if (matching.length > 0) {
                pairs.push(...matching.map(c => new Pair([c, target])));
            }
        }
        return pairs;
    }

    canPlay(currSetType: SetType, high: Pair | undefined) { // overloaded
        return high === undefined || this.weight > high.weight;
    }

    toString() {
        return `a pair of ${this.card1} and ${this.card2}`;
    }

    toStringAsHand() {
        return `${this.card1} and ${this.card2}`;
    }

    getHighest() {
        return this.card1;
    }

    getRoundType() {
        return RoundType.PAIR;
    }

    getSetType() {
        return SetType.STRAIGHT;
    }
}