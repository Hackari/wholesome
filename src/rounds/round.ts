import { Card } from '../card';

// interface
export interface Round {
    weight: number;

    canPlay(currSetType: number, high: Round | undefined): boolean;
    toString(): string;
    toStringAsHand(): string;
    getHighest(): Card;
    getRoundType(): number;
    getSetType(): number;
};