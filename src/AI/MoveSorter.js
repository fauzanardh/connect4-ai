class MoveSorter {
    constructor(width) {
        this.width = width
        this.size = 0;
        this.entries = new Array(width).fill({move: 0n, score: 0, col: 0});
    }

    // Add a move to the container with its score
    add(move, score) {
        let pos = this.size++;
        for (; pos && this.entries[pos-1].score > score; --pos) {
            this.entries[pos] = this.entries[pos - 1];
        }
        this.entries[pos].move = move;
        this.entries[pos].score = score;
    }

    // Get the next move
    getNext() {
        if (this.size)
            return this.entries[--this.size];
        else
            return 0;
    }

    // Resets the move sorter
    reset() {
        this.entries = new Array(this.width).fill({move: 0n, score: 0, col: 0});
        this.size = 0
    }
}

export default MoveSorter;
