import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Card } from '../src/card';
import { Combination } from '../src/combinations/combination';
import { RoundType, SetType } from '../src/constants';

const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'] as const;
const suits = ['D', 'C', 'H', 'S'] as const;

type Rank = (typeof ranks)[number];
type Suit = (typeof suits)[number];

function card(rank: Rank, suit: Suit) {
  return new Card(ranks.indexOf(rank) * 4 + suits.indexOf(suit));
}

function move(cards: Card[]) {
  return Combination.move(cards);
}

describe('card combinations', () => {
  it('accepts singles and ranks ties by suit', () => {
    const threeDiamonds = move([card('3', 'D')]);
    const threeSpades = move([card('3', 'S')]);
    const fourDiamonds = move([card('4', 'D')]);

    assert.equal(threeDiamonds.isValid(), true);
    assert.equal(threeDiamonds.getRoundType(), RoundType.SINGLE);
    assert.equal(threeSpades.canPlay(threeDiamonds), true);
    assert.equal(fourDiamonds.canPlay(threeSpades), true);
    assert.equal(threeDiamonds.canPlay(fourDiamonds), false);
  });

  it('accepts only same-rank pairs and ranks them by highest card', () => {
    const lowThrees = move([card('3', 'D'), card('3', 'C')]);
    const highThrees = move([card('3', 'H'), card('3', 'S')]);
    const lowFours = move([card('4', 'D'), card('4', 'C')]);
    const mixedRanks = move([card('3', 'D'), card('4', 'D')]);

    assert.equal(lowThrees.isValid(), true);
    assert.equal(lowThrees.getRoundType(), RoundType.PAIR);
    assert.equal(mixedRanks.isValid(), false);
    assert.equal(highThrees.canPlay(lowThrees), true);
    assert.equal(lowFours.canPlay(highThrees), true);
    assert.equal(lowThrees.canPlay(lowFours), false);
  });

  it('rejects unsupported card counts, including standalone three-of-a-kind', () => {
    assert.equal(move([]).isValid(), false);
    assert.equal(move([card('5', 'D'), card('5', 'C'), card('5', 'H')]).isValid(), false);
    assert.equal(move([card('5', 'D'), card('5', 'C'), card('5', 'H'), card('9', 'S')]).isValid(), false);
  });

  it('recognizes straights and handles low-straight exceptions', () => {
    const aceToFive = move([card('A', 'D'), card('2', 'C'), card('3', 'H'), card('4', 'S'), card('5', 'D')]);
    const aceToFiveWithBetterFive = move([card('A', 'D'), card('2', 'C'), card('3', 'H'), card('4', 'S'), card('5', 'S')]);
    const twoToSix = move([card('2', 'S'), card('3', 'D'), card('4', 'C'), card('5', 'H'), card('6', 'D')]);
    const threeToSeven = move([card('3', 'S'), card('4', 'D'), card('5', 'C'), card('6', 'H'), card('7', 'D')]);
    const brokenWrap = move([card('Q', 'D'), card('K', 'C'), card('A', 'H'), card('2', 'S'), card('3', 'D')]);

    assert.equal(aceToFive.isValid(), true);
    assert.equal(aceToFive.getSetType(), SetType.STRAIGHT);
    assert.equal(aceToFiveWithBetterFive.canPlay(aceToFive), true);
    assert.equal(twoToSix.isValid(), true);
    assert.equal(twoToSix.getSetType(), SetType.STRAIGHT);
    assert.equal(threeToSeven.getSetType(), SetType.STRAIGHT);
    assert.equal(twoToSix.canPlay(aceToFiveWithBetterFive), true);
    assert.equal(threeToSeven.canPlay(twoToSix), true);
    assert.equal(twoToSix.canPlay(threeToSeven), false);
    assert.equal(brokenWrap.isValid(), false);
  });

  it('recognizes flushes and compares suit before highest card', () => {
    const diamondAceHigh = move([card('3', 'D'), card('6', 'D'), card('8', 'D'), card('10', 'D'), card('A', 'D')]);
    const clubEightHigh = move([card('3', 'C'), card('4', 'C'), card('6', 'C'), card('7', 'C'), card('8', 'C')]);

    assert.equal(diamondAceHigh.isValid(), true);
    assert.equal(diamondAceHigh.getSetType(), SetType.FLUSH);
    assert.equal(clubEightHigh.getSetType(), SetType.FLUSH);
    assert.equal(clubEightHigh.canPlay(diamondAceHigh), true);
    assert.equal(diamondAceHigh.canPlay(clubEightHigh), false);
  });

  it('recognizes full houses by the rank of the three-of-a-kind', () => {
    const threesOverAces = move([card('3', 'D'), card('3', 'C'), card('3', 'H'), card('A', 'D'), card('A', 'C')]);
    const foursOverFives = move([card('4', 'D'), card('4', 'C'), card('4', 'H'), card('5', 'D'), card('5', 'C')]);

    assert.equal(threesOverAces.isValid(), true);
    assert.equal(threesOverAces.getSetType(), SetType.FULL_HOUSE);
    assert.equal(foursOverFives.getSetType(), SetType.FULL_HOUSE);
    assert.equal(foursOverFives.canPlay(threesOverAces), true);
    assert.equal(threesOverAces.canPlay(foursOverFives), false);
  });

  it('recognizes four-of-a-kind sets by the rank of the quads', () => {
    const fours = move([card('4', 'D'), card('4', 'C'), card('4', 'H'), card('4', 'S'), card('A', 'D')]);
    const fives = move([card('5', 'D'), card('5', 'C'), card('5', 'H'), card('5', 'S'), card('3', 'D')]);

    assert.equal(fours.isValid(), true);
    assert.equal(fours.getSetType(), SetType.FOUR_OF_KIND);
    assert.equal(fives.getSetType(), SetType.FOUR_OF_KIND);
    assert.equal(fives.canPlay(fours), true);
    assert.equal(fours.canPlay(fives), false);
  });

  it('orders set categories from straight through straight flush', () => {
    const straight = move([card('3', 'S'), card('4', 'D'), card('5', 'C'), card('6', 'H'), card('7', 'D')]);
    const flush = move([card('3', 'H'), card('5', 'H'), card('7', 'H'), card('9', 'H'), card('J', 'H')]);
    const fullHouse = move([card('4', 'D'), card('4', 'C'), card('4', 'H'), card('5', 'D'), card('5', 'C')]);
    const fourOfKind = move([card('5', 'D'), card('5', 'C'), card('5', 'H'), card('5', 'S'), card('3', 'D')]);
    const straightFlush = move([card('4', 'S'), card('5', 'S'), card('6', 'S'), card('7', 'S'), card('8', 'S')]);

    assert.equal(flush.canPlay(straight), true);
    assert.equal(fullHouse.canPlay(flush), true);
    assert.equal(fourOfKind.canPlay(fullHouse), true);
    assert.equal(straightFlush.canPlay(fourOfKind), true);
    assert.equal(straight.canPlay(straightFlush), false);
  });

  it('compares non-royal straight flushes by suit before highest card', () => {
    const kingHighDiamonds = move([card('9', 'D'), card('10', 'D'), card('J', 'D'), card('Q', 'D'), card('K', 'D')]);
    const sevenHighClubs = move([card('3', 'C'), card('4', 'C'), card('5', 'C'), card('6', 'C'), card('7', 'C')]);
    const eightHighClubs = move([card('4', 'C'), card('5', 'C'), card('6', 'C'), card('7', 'C'), card('8', 'C')]);

    assert.equal(kingHighDiamonds.getSetType(), SetType.STRAIGHT_FLUSH);
    assert.equal(sevenHighClubs.getSetType(), SetType.STRAIGHT_FLUSH);
    assert.equal(sevenHighClubs.canPlay(kingHighDiamonds), true);
    assert.equal(eightHighClubs.canPlay(sevenHighClubs), true);
    assert.equal(kingHighDiamonds.canPlay(sevenHighClubs), false);
  });

  it('treats a royal flush as higher than other straight flushes and ranks royals by suit', () => {
    const kingHighSpades = move([card('9', 'S'), card('10', 'S'), card('J', 'S'), card('Q', 'S'), card('K', 'S')]);
    const royalDiamonds = move([card('10', 'D'), card('J', 'D'), card('Q', 'D'), card('K', 'D'), card('A', 'D')]);
    const royalClubs = move([card('10', 'C'), card('J', 'C'), card('Q', 'C'), card('K', 'C'), card('A', 'C')]);

    assert.equal(kingHighSpades.getSetType(), SetType.STRAIGHT_FLUSH);
    assert.equal(royalDiamonds.getSetType(), SetType.ROYAL_FLUSH);
    assert.equal(royalDiamonds.isValid(), true);
    assert.equal(royalDiamonds.canPlay(kingHighSpades), true);
    assert.equal(royalClubs.canPlay(royalDiamonds), true);
    assert.equal(kingHighSpades.canPlay(royalDiamonds), false);
  });

  it('requires plays to match the active round pattern', () => {
    const single = move([card('8', 'S')]);
    const pair = move([card('9', 'D'), card('9', 'C')]);
    const set = move([card('3', 'S'), card('4', 'D'), card('5', 'C'), card('6', 'H'), card('7', 'D')]);

    assert.equal(single.canPlay(undefined), true);
    assert.equal(pair.canPlay(undefined), true);
    assert.equal(set.canPlay(undefined), true);
    assert.equal(single.canPlay(pair), false);
    assert.equal(pair.canPlay(set), false);
    assert.equal(set.canPlay(single), false);
  });
});
