import { Card } from '../card';
import { RoundType, SetType } from '../constants';

// interface
export interface Round {
    weight: number;

    canPlay(high: Round | undefined): boolean;
    toString(): string;
    toStringAsHand(): string;
    getHighest(): Card;
    getRoundType(): RoundType;
    getSetType(): SetType;
};
