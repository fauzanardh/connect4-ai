import assert from "assert";

class Position {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.nbMoves = 0;
        this.mask = 0n;

        // These variables are going to be hardcoded for now
        // this.bottomMask = 4432676798593n;
        // this.boardMask = 279258638311359n;
        // this.minScore = -18;
        // this.maxScore = 18.5;
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

    // NOT USED
    // Checking if the current node is a terminal node
    // isTerminalNode() {
    //     return this.hasWon() || this.opponentHasWon() || (this.possible() === 0n || this.canWinNext() || this.opponentCanWinNext());
    // }
    // isTerminalNode() {
    //     return (this.possible() === 0n) || this.canWinNext() || this.opponentCanWinNext();
    // }

    // NOT USED
    // Count the total amount of piece (checkers)
    // that the player have
    // countTotalPiece() {
    //     return this.pop_count(this.current_pos);
    // }

    // Check if the player can win next turn
    canWinNext() {
        return this.winning_position() & this.possible();
    }

    // NOT USED
    // Check if the player had already won
    // hasWon() {
    //     return this.alignment(this.current_pos);
    // }

    // NOT USED
    // Count the total amount of piece (checkers)
    // that the opponent have
    // countOpponentTotalPiece() {
    //     return this.pop_count(this.current_pos ^ this.mask);
    // }

    // Check if the opponent can win next turn
    opponentCanWinNext() {
        return this.opponent_winning_position() & this.possible();
    }

    // NOT USED
    // Check if the opponent had already won
    // opponentHasWon() {
    //     return this.alignment(this.current_pos ^ this.mask);
    // }

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
        // /* eslint-disable */
        // for (let x = 0; x < this.width - 2; x++) {
        //     // eslint-disable-next-line no-undef
        //     if (
        //         (((this.column_mask(x) & possibleMask) << (BigInt(this.height) + 1n)) & (this.current_pos ^ this.mask)) !== 0n &&
        //         (((this.column_mask(x) & possibleMask) << (BigInt(this.height) + 1n)) & (2n * BigInt(this.current_pos ^ this.mask))) !== 0n
        //     ) {
        //         forcedMoves = possibleMask & this.column_mask(x);
        //     }
        // }
        // /* eslint-enable */
        // if (forcedMoves) {
        //     if ((forcedMoves & (forcedMoves - 1n)) === 0n)
        //         return 0n;
        //     else
        //         possibleMask = forcedMoves;
        // }
        if (forcedMoves) {
            if ((forcedMoves & (forcedMoves - 1n)) !== 0n)
                return 0n;
            else
                possibleMask = forcedMoves;
        }
        return possibleMask & ~(opponentWin >> 1n);
    }

    // NOT USED
    // Calculate the current window score
    // calculateWindowScore(window, mask) {
    //     let score = 0n;
    //     // Getting player, opponent, and empty(empty is considered as a piece) piece count
    //     const playerCount = this.pop_count(window & this.current_pos);
    //     const opponentCount = this.pop_count(window & (this.current_pos ^ this.mask));
    //     const emptyCount = this.pop_count(mask & ~window);
    //
    //     // Game score heuristics
    //     if (playerCount === 4n)
    //         score += 100n;
    //     else if (playerCount === 3n && emptyCount === 1n)
    //         score += 5n;
    //     else if (playerCount === 2n && emptyCount === 2n)
    //         score += 2n;
    //     if (opponentCount === 3n && emptyCount === 1n)
    //         score -= 4n;
    //     return score;
    // }

    // NOT USED
    // calculateScore() {
    //     let score = 0n;
    //
    //     // Center column
    //     // Getting the center column bitmask
    //     const centerMask = this.column_mask(Math.floor(this.width / 2));
    //     // Counting the total number of checkers inside the center column
    //     const centerCount = this.pop_count(centerMask & (this.current_pos ^ this.mask));
    //     score += centerCount * 3n;
    //
    //     // Vertical
    //     for (let i = 0; i < this.width; i++) {
    //         // Dividing the rows into group of 4
    //         // and calculating the score of that group
    //         for (let j = 0; j < this.height - 3; j++) {
    //             const colMask = this.column_mask(i) & this.slice_col(i, j, j + 4);
    //             const window = colMask & this.mask;
    //             score += this.calculateWindowScore(window, colMask);
    //         }
    //     }
    //
    //     // Horizontal
    //     for (let i = 0; i < this.height; i++) {
    //         // Dividing the rows into group of 4
    //         // and calculating the score of that group
    //         for (let j = 0; j < this.width - 3; j++) {
    //             const rowMask = this.row_mask(i) & this.slice_row(i, j, j + 4);
    //             const window = rowMask & this.mask;
    //             score += this.calculateWindowScore(window, rowMask);
    //         }
    //     }
    //
    //     // Diagonal 1
    //     // Diagonal 2
    //
    //     return Number(score);
    // }

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

    // NOT USED
    // Generate bitmask for the bottom part of each columns
    // bottom(width, height) {
    //     let btm = 0n;
    //     for (let x = 0; x < width; x++) {
    //         // eslint-disable-next-line no-undef
    //         btm |= 1n << BigInt(x * (height + 1));
    //     }
    //     return btm;
    // }

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

    // NOT USED
    // Check if player has won the game
    // alignment(pos) {
    //     /* eslint-disable */
    //
    //     // Vertical
    //     let m = pos & (pos >> 1n);
    //     if (m & (m >> 2n)) return true;
    //
    //     // Horizontal
    //     m = pos & (pos >> BigInt(this.height));
    //     if (m & (m >> BigInt(2 * this.height))) return true;
    //
    //     // Diagonal 1
    //     m = pos & (pos >> BigInt(this.height - 1));
    //     if (m & (m >> BigInt(2 * (this.height - 1)))) return true;
    //
    //     // Diagonal 2
    //     m = pos & (pos >> BigInt(this.height + 1));
    //     if (m & (m >> BigInt(2 * (this.height + 1)))) return true;
    //
    //     /* eslint-enable */
    //
    //     // haven't win yet
    //     return false;
    // }

    // NOT USED
    // Create a bitmask for slicing a row
    // slice_row(row, start, end) {
    //     let sliceMask = 0n
    //     if (typeof row === 'bigint') {
    //         for (let x = start; x < end; x++) {
    //             // eslint-disable-next-line no-undef
    //             sliceMask |= 1n << (BigInt(x * this.height + 1) + row);
    //         }
    //     } else {
    //         for (let x = start; x < end; x++) {
    //             // eslint-disable-next-line no-undef
    //             sliceMask |= 1n << BigInt(x * (this.height + 1) + row);
    //         }
    //     }
    //     return sliceMask;
    // }

    // NOT USED
    // Create a row that already been sliced
    // sliced_row_mask(row, start, end) {
    //     return this.row_mask(row) & this.slice_row(row, start, end);
    // }

    // NOT USED
    // Create a bitmask for slicing a column
    // slice_col(col, start, end) {
    //     let sliceMask = 0n
    //     if (typeof col === 'bigint') {
    //         for (let x = start; x < end; x++) {
    //             // eslint-disable-next-line no-undef
    //             sliceMask |= (1n << BigInt(x)) << (col * BigInt(this.height + 1));
    //         }
    //     } else {
    //         for (let x = start; x < end; x++) {
    //             // eslint-disable-next-line no-undef
    //             sliceMask |= (1n << BigInt(x)) << BigInt(col * (this.height + 1));
    //         }
    //     }
    //     return sliceMask;
    // }

    // NOT USED
    // Create a col that already been sliced
    // sliced_col_mask(col, start, end) {
    //     return this.column_mask(col) & this.slice_col(col, start, end);
    // }

    // NOT USED
    // top_most_mask() {
    //     let bitmask = 0n;
    //     for (let x = 0; x < this.width; x++)
    //         // eslint-disable-next-line no-undef
    //         bitmask |= (1n << BigInt(this.height)) << BigInt(x * (this.height + 1));
    //     return bitmask;
    // }

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

    // NOT USED
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
