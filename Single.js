const Card = require('./Card');

const {SINGLE, STRAIGHT} = require('./Constants')

class Single {
    constructor(card) {
        this.card = card;
    }

    canPlay(currSetType, high) {
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

module.exports = Single;