const MAX_PLAYERS = 2;
const ROUND_TYPES = ['Single', 'Pair', 'Set', 'Any'];
const SET_TYPES = ['Straight', 'Flush', 'Full House', 'Straight Flush', 'Royal Flush'];

const SINGLE = 0;
const PAIR = 1;
const SET = 2;
const ANY = 3;

const STRAIGHT = 0;
const FLUSH = 1;
const FULL_HOUSE = 2;
const STRAIGHT_FLUSH = 3;
const ROYAL_FLUSH = 4;
const INVALID_SET = -1;

const THREE_DIAMONDS = 0;
const FORCE_START = true;

module.exports = {
  MAX_PLAYERS,
  ROUND_TYPES,
  SET_TYPES,
  SINGLE,
  PAIR,
  SET,
  ANY,
  STRAIGHT,
  FLUSH,
  FULL_HOUSE,
  STRAIGHT_FLUSH,
  ROYAL_FLUSH,
  INVALID_SET,
  THREE_DIAMONDS,
  FORCE_START
};
