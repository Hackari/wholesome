const MAX_PLAYERS = 2; // duplicate
const INVALID_ROUND = 0

enum RoundType {
	SINGLE = 'Single',
	PAIR = 'Pair',
	SET = 'Set',
	ANY = 'Any'
}

enum SetType {
	INVALID,
	STRAIGHT,
	FLUSH,
	FULL_HOUSE,
	FOUR_OF_KIND,
	STRAIGHT_FLUSH
}

// move to card.ts
const THREE_DIAMONDS = 0;
const TWO_SPADES = 51;
const FORCE_START = true;

export {
	RoundType,
	SetType,
	MAX_PLAYERS,
	INVALID_ROUND,
	THREE_DIAMONDS,
	TWO_SPADES,
	FORCE_START
};
