const MAX_PLAYERS = 2;
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

const THREE_DIAMONDS = 0;
const FORCE_START = true;

export {
	RoundType,
	SetType,
	MAX_PLAYERS,
	INVALID_ROUND,
	THREE_DIAMONDS,
	FORCE_START
};
