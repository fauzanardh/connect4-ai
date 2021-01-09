import assert from "assert";

class Position {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.nbMoves = 0;
        this.mask = 0n;
        this.minScore = -(width * height) / 2 + 3;
        this.maxScore = (width * height + 1) / 2 - 3;
        this.bottomMask = this.row_mask(0);
        // eslint-disable-next-line no-undef
        this.boardMask = this.bottomMask * ((1n << BigInt(height)) - 1n);
        this.current_pos = 0n;
    }

    /* "Public" Functions */

    // Check if the column is playable
    // by doing AND operation on the top bit of the column
    isPlayable(col) {
        return (this.mask & this.top_mask_col(col)) === 0n;
    }

    clone() {
        // Cloning the position class so it
        // doesn't interfere with the original one
        // *Hacky but it works*
        const pos2 = Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            JSON.parse(JSON.stringify(this, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value))
        );
        // Restoring the vars back to bigint datatype
        /* eslint-disable */
        pos2.current_pos = BigInt(pos2.current_pos);
        pos2.mask = BigInt(pos2.mask);
        pos2.bottomMask = BigInt(pos2.bottomMask);
        pos2.boardMask = BigInt(pos2.boardMask);
        assert(pos2.current_pos === this.current_pos);
        assert(pos2.mask === this.mask);
        assert(pos2.bottomMask === this.bottomMask);
        assert(pos2.boardMask === this.boardMask);
        /* eslint-enable */
        return pos2;
    }

    // Simulating 'playing' the checkers
    // in the solver with the desired move bit
    play(move) {
        // XOR-ing the current position with the mask
        // to get either the player's checkers or the opponent's checkers
        this.current_pos ^= this.mask;
        // Adding the currently played checker to the mask
        this.mask |= move;
        this.nbMoves++;
    }

    // Simulating 'playing' the checkers
    // in the solver on the corresponding column
    playCol(col) {
        this.play((this.mask + this.bottom_mask_col(col)) & this.column_mask(col));
    }

    // Check if the player can win next turn
    canWinNext() {
        return this.winning_position() & this.possible();
    }

    // Check if the opponent can win next turn
    opponentCanWinNext() {
        return this.opponent_winning_position() & this.possible();
    }

    // Getting all possible moves
    possible() {
        return (this.mask + this.bottomMask) & this.boardMask;
    }

    // Compute all possible moves that doesn't lose in one turn
    possibleNonLosingMoves() {
        assert(!this.canWinNext());
        let possibleMask = this.possible();
        const opponentWin = this.opponent_winning_position();
        // const opponentCheckers = this.current_pos ^ this.mask;
        let forcedMoves = possibleMask & opponentWin;
        if (forcedMoves) {
            if ((forcedMoves & (forcedMoves - 1n)) !== 0n)
                return 0n;
            else
                possibleMask = forcedMoves;
        }
        return possibleMask & ~(opponentWin >> 1n);
    }

    moveScore(move) {
        return this.pop_count(this.compute_winning_position(this.current_pos | move, this.mask));
    }

    // Checking if this move is guaranteed win
    isWinningMove(col) {
        return this.winning_position() & this.possible() & this.column_mask(col);
    }

    // Checking if this move is guaranteed win for the opponent
    isOpponentWinningMove(col) {
        return this.opponent_winning_position() & this.possible() & this.column_mask(col);
    }

    // Used for getting the value out of hash table
    key() {
        return this.current_pos + this.mask;
    }

    /* "Private" Functions */

    // Counts the number of bit set to one in a 64bits integer
    pop_count(m) {
        let c;
        for (c = 0n; m; c++) m &= m - 1n;
        // eslint-disable-next-line no-undef
        return c;
    }

    // Compute winning position for the current player
    winning_position() {
        return this.compute_winning_position(this.current_pos, this.mask);
    }

    // Compute winning position for the opponent by xor-ing the current player with the mask
    opponent_winning_position() {
        return this.compute_winning_position(this.current_pos ^ this.mask, this.mask);
    }

    // Computing all of the winning position
    compute_winning_position(pos, mask) {
        /* eslint-disable */

        // Vertical
        let r = (pos << 1n) & (pos << 2n) & (pos << 3n);

        // Horizontal
        let p = (pos << BigInt((this.height + 1))) & (pos << BigInt(2 * (this.height + 1)));
        r |= p & (pos << BigInt(3 * (this.height + 1)));
        r |= p & (pos >> BigInt((this.height + 1)));
        p = (pos >> BigInt((this.height + 1))) & (pos >> BigInt(2 * (this.height + 1)));
        r |= p & (pos << BigInt((this.height + 1)));
        r |= p & (pos >> BigInt(3 * (this.height + 1)));

        // Diagonal 1
        p = (pos << BigInt(this.height)) & (pos << BigInt(2 * this.height));
        r |= p & (pos << BigInt(3 * this.height));
        r |= p & (pos >> BigInt(this.height));
        p = (pos >> BigInt(this.height)) & (pos >> BigInt(2 * this.height));
        r |= p & (pos << BigInt(this.height));
        r |= p & (pos >> BigInt(3 * this.height));

        // Diagonal 2
        p = (pos << BigInt(this.height + 2)) & (pos << BigInt(2 * (this.height + 2)));
        r |= p & (pos << BigInt(3 * (this.height + 2)));
        r |= p & (pos >> BigInt(this.height + 2));
        p = (pos >> BigInt(this.height + 2)) & (pos >> BigInt(2 * (this.height + 2)));
        r |= p & (pos << BigInt(this.height + 2));
        r |= p & (pos >> BigInt(3 * (this.height + 2)));

        /* eslint-enable */
        return r & (this.boardMask ^ mask);
    }

    // Getting the top bit for the specified column
    top_mask_col(col) {
        if (typeof col === 'bigint')
            // eslint-disable-next-line no-undef
            return (1n << BigInt(this.height - 1)) << (col * BigInt(this.height + 1));
        else
            // eslint-disable-next-line no-undef
            return (1n << BigInt(this.height - 1)) << BigInt(col * (this.height + 1));
    }

    // Getting the bottom bit for the specified column
    bottom_mask_col(col) {
        if (typeof col === 'bigint')
            // eslint-disable-next-line no-undef
            return 1n << (col * BigInt(this.height + 1));
        else
            // eslint-disable-next-line no-undef
            return 1n << BigInt(col * (this.height + 1));
    }

    // Getting the columns' bit for the specified row
    row_mask(row) {
        if (typeof row === 'bigint') {
            let bitmask = 0n;
            for (let x = 0; x < this.width; x++)
                // eslint-disable-next-line no-undef
                bitmask |= 1n << (BigInt(x * (this.height + 1)) + row);
            return bitmask;
        } else {
            let bitmask = 0n;
            for (let x = 0; x < this.width; x++)
                // eslint-disable-next-line no-undef
                bitmask |= 1n << BigInt(x * (this.height + 1) + row);
            return bitmask;
        }
    }

    // Getting the entire column's bit for the specified column
    column_mask(col) {
        if (typeof col === 'bigint')
            // eslint-disable-next-line no-undef
            return ((1n << BigInt(this.height)) - 1n) << (col * BigInt(this.height + 1));
        else

            // eslint-disable-next-line no-undef
            return ((1n << BigInt(this.height)) - 1n) << BigInt(col * (this.height + 1));
    }
}

export default Position;
