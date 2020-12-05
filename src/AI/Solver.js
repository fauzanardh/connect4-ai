import assert from "assert";
import Hashtable from 'jshashtable';
import MoveSorter from "@/AI/MoveSorter";
// import TranspositionTable from "@/AI/TranspositionTable";

class Solver {
    constructor(width) {
        this.nodeCount = 0;
        this.width = width;
        this.hashTable = new Hashtable();
        // this.transpositionTable = new TranspositionTable();
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
    // minimax(pos, depth, alpha, beta, maximizingPlayer) {
    //     this.nodeCount++;
    //     // console.log(pos, depth, alpha, beta, maximizingPlayer);
    //     // console.log("piece count", pos.countTotalPiece());
    //     // console.log("opponent piece count", pos.countOpponentTotalPiece());
    //     // console.log(pos.calculateScore());
    //     // console.log("==========================================")
    //
    //
    //     if (depth === 0)
    //         return {val: Number(pos.calculateScore()), col: -1};
    //     else if (pos.isTerminalNode()) {
    //         if (pos.hasWon())
    //             return {val: 10000, col: -1};
    //         else if (pos.opponentHasWon())
    //             return {val: -10000, col: -1};
    //         else // draw
    //             return {val: 0, col: -1};
    //     }
    //
    //     // Getting the non losing moves
    //     let nextPossibleMove = pos.possibleNonLosingMoves();
    //     // Check if there's no possible *non* losing moves
    //     // opponent wins next turn
    //     if (nextPossibleMove === 0n)
    //         return {val: -(pos.width * pos.height - pos.nbMoves) / 2, col: -2};
    //
    //     let moves = new MoveSorter(pos.width);
    //     for (let i = pos.width; i--;) {
    //         let move = nextPossibleMove & pos.column_mask(this.columnExpOrder[i]);
    //         if (move)
    //             moves.add(move, pos.moveScore(move), this.columnExpOrder[i]);
    //     }
    //
    //     let bestColumn = 0;
    //     let nextMove = moves.getNext();
    //
    //     // Cloning the position class so it
    //     // doesn't interfere with the original one
    //     // *Hacky but it works*
    //     const pos2 = Object.assign(
    //         Object.create(Object.getPrototypeOf(pos)),
    //         JSON.parse(JSON.stringify(pos, (key, value) =>
    //             typeof value === 'bigint' ? value.toString() : value))
    //     );
    //     // Restoring the vars back to bigint datatype
    //     /* eslint-disable */
    //     pos2.current_pos = BigInt(pos2.current_pos);
    //     pos2.mask = BigInt(pos2.mask);
    //     pos2.bottomMask = BigInt(pos2.bottomMask);
    //     pos2.boardMask = BigInt(pos2.boardMask);
    //     /* eslint-enable */
    //
    //     if (maximizingPlayer) {
    //         let value = -(pos.width * pos.height - 2 - pos.nbMoves) / 2;
    //         while (nextMove) {
    //             pos2.play(nextMove.move);
    //             nextMove = moves.getNext();
    //             let minimaxRet = this.minimax(pos2, depth - 1, alpha, beta, !maximizingPlayer);
    //             if (minimaxRet.val > value) {
    //                 value = minimaxRet.val;
    //                 bestColumn = nextMove.col;
    //             }
    //             alpha = Math.max(alpha, value);
    //             if (alpha >= beta) break;
    //         }
    //         return {val: value, col: bestColumn};
    //     } else {
    //         let value = (pos.width * pos.height - 1 - pos.nbMoves) / 2;
    //         while (nextMove) {
    //             pos2.play(nextMove.move);
    //             nextMove = moves.getNext();
    //             let minimaxRet = this.minimax(pos2, depth-1, alpha, beta, !maximizingPlayer);
    //             if (minimaxRet.val < value) {
    //                 value = minimaxRet.val;
    //                 bestColumn = nextMove.col;
    //             }
    //             beta = Math.min(beta, value);
    //             if (alpha >= beta) break;
    //         }
    //         return {val: value, col: bestColumn};
    //     }
    // }

    // Negamax is the other variant of minimax algorithm
    // this negamax also use the alpha-beta pruning method
    // to make the search faster
    negamax(pos, alpha, beta) {
        assert(alpha < beta);
        assert(!pos.canWinNext());
        this.nodeCount++;
        if (this.nodeCount % 100000 === 0) console.log(this.nodeCount);

        let nextPossibleMove = pos.possibleNonLosingMoves();
        // Check if there's no possible *non* losing moves
        if (nextPossibleMove === 0n)
            return {val: -(pos.width * pos.height - pos.nbMoves) / 2, col: -1};

        // Check if it's a draw
        if (pos.nbMoves >= pos.width * pos.height - 2) return {val: 0, col: -1};

        // if (depth === 0)
        //     return {val: pos.calculateScore(), col: -1};

        // Lower bound of the search
        let min = -(pos.width * pos.height - 2 - pos.nbMoves) / 2;
        if (alpha < min) {
            alpha = min;
            // Make the search windows smaller
            if (alpha >= beta) return {val: alpha, col: -1};
        }

        // Upper bound of the search
        let max = (pos.width * pos.height - 1 - pos.nbMoves) / 2;
        if (beta > max) {
            beta = max;
            // Make the search windows smaller
            if (alpha >= beta) return {val: beta, col: -1};
        }

        // Search the hash table if the value already calculated
        let key = pos.key();
        let val = this.hashTable.get(key);
        if (val) {
            // Check if the pos have a lower bound
            if (val > pos.maxScore - pos.minScore + 1) {
                min = val + 2 * pos.minScore - pos.maxScore - 2;
                if (alpha < min) {
                    alpha = min;
                    if (alpha >= beta) return {val: alpha, col: -1};
                }
            } else { // The pos have an upper bound
                max = val + pos.minScore - 1;
                if (beta > max) {
                    beta = max;
                    if (alpha >= beta) return {val: beta, col: -1};
                }
            }
        }

        let moves = new MoveSorter(pos.width);
        for (let i = pos.width; i--;) {
            let move = nextPossibleMove & pos.column_mask(this.columnExpOrder[i]);
            if (move)
                moves.add(move, pos.moveScore(move), this.columnExpOrder[i]);
        }

        // Computing the scores of all possible moves
        // and keep the best one
        // let bestMove = this.columnExpOrder[Math.floor(Math.random() * (pos.height + 1))];
        // TODO fix bestMove, it's not working yet
        let bestMove = 0;
        let nextMove = moves.getNext();
        while (nextMove) {
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
            pos2.play(nextMove.move);
            // console.log(pos2.current_pos ^ pos2.mask);

            // calculate the score recursively
            const score = -this.negamax(pos2, -beta, -alpha).val;
            // Pruning the search if we find better move
            if (score >= beta) {
                bestMove = nextMove.col;
                this.hashTable.put(key, score + pos.maxScore - 2 * pos.minScore + 2);
                return {val: score, col: bestMove};
            }
            // Reducing the search windows to the new [alpha-beta]
            if (score > alpha) alpha = score;
            // continues to the next move
            nextMove = moves.getNext();
        }
        // Saving the upper bound for the position to the hashtable
        this.hashTable.put(key, alpha - pos.minScore + 1);
        return {val: alpha, col: bestMove};
    }

    reset() {
        this.nodeCount = 0;
        // this.transpositionTable = new TranspositionTable();
        this.hashTable = new Hashtable();
    }

    // solve(pos, weak = false) {
    //     this.nodeCount = 0;
    //     if (weak)
    //         return this.minimax(pos, 8, -1, 1, true);
    //     else
    //         return this.minimax(pos, 8, -pos.width * pos.height / 2, pos.width * pos.height / 2, true);
    // }

    solve(pos, weak = false) {
        this.nodeCount = 0;
        if (pos.canWinNext())
            return (pos.width * pos.height + 1 - pos.nbMoves) / 2;
        let min = -pos.width * pos.height / 2;
        let max = pos.width * pos.height / 2;
        if (weak) {
            min = -1;
            max = 1;
        }
        let bestMove;

        // iteratively narrowing the min and max
        // range of the search window
        while (min < max) {
            let med = min + (max - min) / 2;
            if (med <= 0 && min / 2 < med)
                med = min / 2;
            else if (med >= 0 && max / 2 > med)
                med = max / 2;
            const ret = this.negamax(pos, med, med + 1);
            const r = ret.val;
            if (r <= med)
                max = r;
            else {
                bestMove = ret.col;
                min = r;
            }
        }
        return {val: min, col: bestMove};
    }


    /* "Private" Functions */
}

export default Solver;
