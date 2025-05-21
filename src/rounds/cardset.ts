import { Card } from '../card';
import {
    SET,
    SET_TYPES,
    STRAIGHT,
    FLUSH,
    FULL_HOUSE,
    STRAIGHT_FLUSH,
    ROYAL_FLUSH,
    INVALID_SET
} from '../constants';
import { Round } from './round';

const ACE = 11;
const TWO = 12;
const THREE = 0;
const FOUR = 1;
const FIVE = 2;

export class CardSet implements Round {
    card1: Card;
    card2: Card;
    card3: Card;
    card4: Card;
    card5: Card;
    highCard: Card;
    setType: number;

    weight: number;

    constructor(selectedCards: Card[]) {
        selectedCards.sort(Card.compareByValueThenSuit);
        this.card1 = selectedCards[0];
        this.card2 = selectedCards[1];
        this.card3 = selectedCards[2];
        this.card4 = selectedCards[3];
        this.card5 = selectedCards[4];
        this.highCard = this.card5;
        this.setType = INVALID_SET;
        this.weight = this.highCard.number;
    }

    static genSets(hand: Card[]) {
        const result: Card[][] = [];
        const current: Card[] = [];
        const n = hand.length;

        function combination(idx: number, final: number, r: number) {
            if (current.length === final) { // end case
                result.push(current);
                return;
            }
            for (let i = idx; i < n - r + 1; i++) {
                current.push(hand[i]);
                combination(i + 1, final, r - 1);
                current.pop();
            }
        }

        combination(0, 5, 5); // 5-combinations of the hand, at most 13C5 = 1287
        return result.map(a => new CardSet(a)).filter(s => s.getPlayedSet() > INVALID_SET);
    }

    isFlush() {
        const suit = this.card1.suit;
        return (
            this.card2.suit === suit &&
            this.card3.suit === suit &&
            this.card4.suit === suit &&
            this.card5.suit === suit
        );
    }

    isStraight() {
        const v1 = this.card1.rank;
        const v2 = this.card2.rank;
        const v3 = this.card3.rank;
        const v4 = this.card4.rank;
        const v5 = this.card5.rank;

        if (v2 === v1 + 1 && v3 === v2 + 1 &&
            v4 === v3 + 1 && v5 === v4 + 1) {
                return true;
        }

        if (v4 == ACE && v5 == TWO &&
            v1 == THREE && v2 == FOUR && v3 == FIVE) {
                return true;
            }
            
        return false
    }


    isStraightFlush() {
        return this.isStraight() && this.isFlush();
    }

    isRoyalFlush() {
        return this.isStraightFlush() && this.card5.rank == ACE;

    }

    isFullHouse() {
        const v1 = this.card1.rank;
        const v2 = this.card2.rank;
        const v3 = this.card3.rank;
        const v4 = this.card4.rank;
        const v5 = this.card5.rank;
        
        const isTripleFirst = (v1 === v2 && v2 === v3) && (v4 === v5);
        
        if (isTripleFirst) {
            this.highCard = this.card3;
            return true;
        }

        const isTripleLast  = (v1 === v2) && (v3 === v4 && v4 === v5);

        return isTripleLast;
    }

    getPlayedSet() {
        if (this.isRoyalFlush()) { 
            this.setType = ROYAL_FLUSH;
            return ROYAL_FLUSH; 
        }
        if (this.isStraightFlush()) { 
            this.setType = STRAIGHT_FLUSH;
            return STRAIGHT_FLUSH; 
        }
        if (this.isFullHouse()) { 
            this.setType = FULL_HOUSE;
            return FULL_HOUSE; 
        }
        if (this.isFlush()) { 
            this.setType = FLUSH;
            return FLUSH; 
        }
        if (this.isStraight()) {
            this.setType = STRAIGHT;
            return STRAIGHT; 
        }
        return INVALID_SET;
    }

    canPlay(currSetType: number, high: CardSet | undefined) {
        let playedSetType = this.getPlayedSet();
        let isSameSetType = playedSetType >= currSetType;
        let isHigher = high === undefined || this.weight >= high.weight;
        return isSameSetType && isHigher;
    }

    toString() {
        return `a ${SET_TYPES[this.setType]} of ${this.card1}, ${this.card2}, ${this.card3}, ${this.card4}, and ${this.card5}`;
    }

    toStringAsHand() {
        return `${this.card1}, ${this.card2}, ${this.card3}, ${this.card4}, and ${this.card5}`;
    }

    getHighest() {
        return this.highCard;
    }

    getRoundType() {
        return SET;
    }

    getSetType() {
        return this.setType;
    }
}