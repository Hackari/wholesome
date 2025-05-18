const Card = require('./Card');

const {PAIR, STRAIGHT} = require('./Constants')

class Pair {
    constructor(selectedCards) {
        let card1 = selectedCards[0];
        let card2 = selectedCards[1];
        if (card1.number > card2.number) {
            this.card1 = card1;
            this.card2 = card2;
        } else {
            this.card2 = card1;
            this.card1 = card2;
        }
    }

    canPlay(currSetType, high) {
        let isHigher = this.card1.number >= high.number;
        let isSameNumber = this.card1.value == this.card2.value;
        return isSameNumber && isHigher;
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
        return PAIR;
    }

    getSetType() {
        return STRAIGHT;
    }
}

module.exports = Pair;