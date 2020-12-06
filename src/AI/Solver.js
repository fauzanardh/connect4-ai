// import assert from "assert";
import Hashtable from 'jshashtable';
import MoveSorter from "@/AI/MoveSorter";

class Solver {
    constructor(width) {
        this.nodeCount = 0;
        this.width = width;
        this.hashTable = new Hashtable();
        this.columnExpOrder = new Array(width).fill(0);
        // Initializing the column exploration order
        for (let x = 0; x < width; x++)
            // start with the center column
            // ex for 7 column [ 3, 2, 4, 1, 5, 0 ,6 ]
            this.columnExpOrder[x] = Math.ceil(width / 2 + (1 - 2 * (x % 2)) * (x + 1) / 2) - 1;
    }

    /* "Public" Functions */

    // MiniMax is basically a backtracking algorithm to find the optimal move
    // In MiniMax, the two players are called maximizer and minimizer
    // this is slower than the negamax function
    // return value:
    // val == 0, col == -1 ==> draw
    // val == 10000, col == -1 ==> playerWon
    // val == -10000, col == -1 ==> opponentWon
    // col == - 2 ==> Resigned
    minimax(pos, alpha, beta, maximizingPlayer) {
        this.nodeCount++;
        if (this.nodeCount % 100000 === 0) console.log(this.nodeCount);

        if (pos.canWinNext()) { // if Player can win
            for (let x = 0; x < pos.width; x++) {
                if (pos.isWinningMove(x))
                    return {val: 10000, col: x};
            }
            return {val: beta, col: -1};
        } else if (pos.opponentCanWinNext()) { // if Opponent can win
            for (let x = 0; x < pos.width; x++) {
                if (pos.isOpponentWinningMove(x))
                    return {val: -10000, col: x};
            }
            return {val: alpha, col: -1};
        } else if (pos.nbMoves >= pos.width * pos.height - 2) // if draw
            return {val: 0, col: -1};

        // Getting the non losing moves
        // eslint-disable-next-line no-undef
        let nextPossibleMove = pos.possibleNonLosingMoves();
        // Check if there's no possible *non* losing moves
        // opponent wins next turn
        if (nextPossibleMove === 0n)
            return {val: -10000, col: -1};

        // Getting the already evaluated value from the hashtable
        let key = pos.key();
        let val = this.hashTable.get(key);
        if (val) {
            if (val < beta) { // upper bound
                beta = val;
                if (alpha >= beta) return beta;
            } else if (alpha < beta) { // lower bound
                alpha = val
                if (alpha >= beta) return alpha;
            }
        }

        // Setting up the move sorted based on the score
        let moves = new MoveSorter(pos.width);
        for (let i = pos.width; i--;) {
            let move = nextPossibleMove & pos.column_mask(this.columnExpOrder[i]);
            if (move)
                moves.add(move, pos.moveScore(move), this.columnExpOrder[i]);
        }

        let bestColumn = 0;
        let nextMove = moves.getNext();

        // Cloning the position class so it
        // doesn't interfere with the original one
        // *Hacky but it works*
        const pos2 = Object.assign(
            Object.create(Object.getPrototypeOf(pos)),
            JSON.parse(JSON.stringify(pos, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value))
        );
        // Restoring the vars back to bigint datatype
        /* eslint-disable */
        pos2.current_pos = BigInt(pos2.current_pos);
        pos2.mask = BigInt(pos2.mask);
        pos2.bottomMask = BigInt(pos2.bottomMask);
        pos2.boardMask = BigInt(pos2.boardMask);
        /* eslint-enable */

        if (maximizingPlayer) {
            let value = Number.NEGATIVE_INFINITY;
            // Will loop until there's no move left in the move sorter
            while (nextMove) {
                // Play the move
                pos2.play(nextMove.move);
                let ret = this.minimax(pos2, alpha, beta, false);
                if (ret.val > value) {
                    value = ret.val;
                    bestColumn = nextMove.col;
                    this.hashTable.put(key, value);
                }
                alpha = Math.max(alpha, value);
                if (alpha >= beta) {
                    this.hashTable.put(key, alpha);
                    break;
                }
                nextMove = moves.getNext();
            }
            return {val: value, col: bestColumn};
        } else {
            let value = Number.POSITIVE_INFINITY;
            // Will loop until there's no move left in the move sorter
            while (nextMove) {
                // Play the move
                pos2.play(nextMove.move);
                let ret = this.minimax(pos2, alpha, beta, true);
                if (ret.val < value) {
                    value = ret.val;
                    bestColumn = nextMove.col;
                    this.hashTable.put(key, value);
                }
                beta = Math.min(beta, value);
                if (alpha >= beta) {
                    this.hashTable.put(key, beta);
                    break;
                }
                nextMove = moves.getNext();
            }
            return {val: value, col: bestColumn};
        }
    }

    // Negamax is the other variant of minimax algorithm
    // this negamax also use the alpha-beta pruning method
    // to make the search faster
    // negamax(pos, alpha, beta) {
    //     assert(alpha < beta);
    //     assert(!pos.canWinNext());
    //     this.nodeCount++;
    //     if (this.nodeCount % 100000 === 0) console.log(this.nodeCount);
    //
    //     let nextPossibleMove = pos.possibleNonLosingMoves();
    //     // Check if there's no possible *non* losing moves
    //     if (nextPossibleMove === 0n)
    //         return {val: -(pos.width * pos.height - pos.nbMoves) / 2, move: -1n};
    //
    //     // Check if it's a draw
    //     if (pos.nbMoves >= pos.width * pos.height - 2) return {val: 0, move: -1n};
    //
    //     // Lower bound of the search
    //     let min = -(pos.width * pos.height - 2 - pos.nbMoves) / 2;
    //     if (alpha < min) {
    //         alpha = min;
    //         // Make the search windows smaller
    //         if (alpha >= beta) return {val: alpha, move: -1n};
    //     }
    //
    //     // Upper bound of the search
    //     let max = (pos.width * pos.height - 1 - pos.nbMoves) / 2;
    //     if (beta > max) {
    //         beta = max;
    //         // Make the search windows smaller
    //         if (alpha >= beta) return {val: beta, move: -1n};
    //     }
    //
    //     // Search the hash table if the value already calculated
    //     let key = pos.key();
    //     let val = this.transpositionTable.get(key);
    //     if (val) {
    //         console.log(val, pos, alpha, beta);
    //         // Check if the pos have a lower bound
    //         if (val > pos.maxScore - pos.minScore + 1) {
    //             min = val + 2 * pos.minScore - pos.maxScore - 2;
    //             if (alpha < min) {
    //                 alpha = min;
    //                 // console.log(key, val, alpha, beta);
    //                 if (alpha >= beta) return {val: alpha, move: -1n};
    //             }
    //         } else { // The pos have an upper bound
    //             max = val + pos.minScore - 1;
    //             if (beta > max) {
    //                 beta = max;
    //                 // console.log(key, val, alpha, beta);
    //                 if (alpha >= beta) return {val: beta, move: -1n};
    //             }
    //         }
    //     }
    //
    //     let moves = new MoveSorter(pos.width);
    //     for (let i = pos.width; i--;) {
    //         let move = nextPossibleMove & pos.column_mask(this.columnExpOrder[i]);
    //         if (move)
    //             moves.add(move, pos.moveScore(move), this.columnExpOrder[i]);
    //     }
    //
    //     // Computing the scores of all possible moves
    //     // and keep the best one
    //     let nextMove = moves.getNext();
    //     while (nextMove) {
    //         // Cloning the position class so it
    //         // doesn't interfere with the original one
    //         // *Hacky but it works*
    //         const pos2 = Object.assign(
    //             Object.create(Object.getPrototypeOf(pos)),
    //             JSON.parse(JSON.stringify(pos, (key, value) =>
    //                 typeof value === 'bigint' ? value.toString() : value))
    //         );
    //         // Restoring the vars back to bigint datatype
    //         /* eslint-disable */
    //         pos2.current_pos = BigInt(pos2.current_pos);
    //         pos2.mask = BigInt(pos2.mask);
    //         pos2.bottomMask = BigInt(pos2.bottomMask);
    //         pos2.boardMask = BigInt(pos2.boardMask);
    //         /* eslint-enable */
    //         pos2.play(nextMove.move);
    //         // console.log(pos2.current_pos ^ pos2.mask);
    //
    //         // calculate the score recursively
    //         const score = -this.negamax(pos2, -beta, -alpha);
    //         // Pruning the search if we find better move
    //         if (score >= beta) {
    //             this.transpositionTable.put(key, score + pos.maxScore - 2 * pos.minScore + 2);
    //             return {val: score, move: nextMove.move};
    //         }
    //         // Reducing the search windows to the new [alpha-beta]
    //         // eslint-disable-next-line no-unreachable
    //         if (score > alpha) alpha = score;
    //         // continues to the next move
    //         nextMove = moves.getNext();
    //     }
    //     // Saving the upper bound for the position to the hashtable
    //     this.transpositionTable.put(key, alpha - pos.minScore + 1);
    //     return {val:alpha, move:0};
    // }

    // NOT USED
    // reset() {
    //     this.nodeCount = 0;
    //     this.hashTable = new Hashtable();
    // }

    // solve(pos, weak = false) {
    //     this.nodeCount = 0;
    //     if (weak)
    //         return this.minimax(pos, 8, -1, 1, true);
    //     else
    //         return this.minimax(pos, 8, -pos.width * pos.height / 2, pos.width * pos.height / 2, true);
    // }

    solve(pos, weak = false) {
        this.nodeCount = 0;
        if (weak)
            return this.minimax(pos, -1, 1, true);
        else
            return this.minimax(pos, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true);
        // if (pos.canWinNext())
        //     return (pos.width * pos.height + 1 - pos.nbMoves) / 2;
        // let min = -pos.width * pos.height / 2;
        // let max = pos.width * pos.height / 2;
        // if (weak) {
        //     min = -1;
        //     max = 1;
        // }
        //
        // // iteratively narrowing the min and max
        // // range of the search window
        // while (min < max) {
        //     let med = min + (max - min) / 2;
        //     if (med <= 0 && min / 2 < med)
        //         med = min / 2;
        //     else if (med >= 0 && max / 2 > med)
        //         med = max / 2;
        //     const r = this.negamax(pos, med, med + 1);
        //     if (r <= med)
        //         max = r;
        //     else
        //         min = r;
        // }
        // return min;
    }


    /* "Private" Functions */
}

export default Solver;
