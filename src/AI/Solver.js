import assert from "assert";
import Hashtable from 'jshashtable';
import MoveSorter from "@/AI/MoveSorter";

class Solver {
    constructor(width) {
        this.nodeCount = 0;
        this.width = width;
        this.hashTable = new Hashtable();
        this.columnExpOrder = new Array(width).fill(0);
        this.columnExpOrderRev = new Array(width).fill(0);
        // Initializing the column exploration order
        for (let x = 0; x < width; x++) {
            // start with the center column
            // ex for 7 column [ 3, 2, 4, 1, 5, 0, 6 ]
            this.columnExpOrder[x] = Math.ceil(width / 2 + (1 - 2 * (x % 2)) * (x + 1) / 2) - 1;
            // reversed
            // ex for 7 column [ 6, 0, 5, 1, 4, 2, 3 ]
            this.columnExpOrderRev[(width - 1) - x] = Math.ceil(width / 2 + (1 - 2 * (x % 2)) * (x + 1) / 2) - 1;
        }
    }

    /* "Public" Functions */

    negamax(pos, alpha, beta) {
        assert(alpha < beta);
        // assert(!pos.canWinNext());
        this.nodeCount++;

        if (pos.canWinNext())
            return (pos.width * pos.height + 1 - pos.nbMoves) / 2;


        let nextPossibleMove = pos.possibleNonLosingMoves();
        // Check if there's no possible *non* losing moves
        if (nextPossibleMove === 0n)
            return -(pos.width * pos.height - pos.nbMoves) / 2;

        // Check if it's a draw
        if (pos.nbMoves >= pos.width * pos.height - 2) return 0;

        // Lower bound of the search
        let min = -(pos.width * pos.height - 2 - pos.nbMoves) / 2;
        if (alpha < min) {
            alpha = min;
            // Make the search windows smaller
            if (alpha >= beta) return alpha;
        }

        // Upper bound of the search
        let max = (pos.width * pos.height - 1 - pos.nbMoves) / 2;
        if (beta > max) {
            beta = max;
            // Make the search windows smaller
            if (alpha >= beta) return beta;
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
                    if (alpha >= beta) return alpha;
                }
            } else { // The pos have an upper bound
                max = val + pos.minScore - 1;
                if (beta > max) {
                    beta = max;
                    if (alpha >= beta) return beta;
                }
            }
        }

        let moves = new MoveSorter(pos.width);
        for (let i = pos.width; i--;) {
            let move = nextPossibleMove & pos.column_mask(this.columnExpOrder[i]);
            if (move)
                moves.add(move, pos.moveScore(move));
        }

        // Computing the scores of all possible moves
        // and keep the best one
        let nextMove = moves.getNext();
        while (nextMove) {
            const pos2 = pos.clone();
            pos2.play(nextMove.move);

            // calculate the score recursively
            let score = -this.negamax(pos2, -beta, -alpha);

            // Pruning the search if we find better move
            if (score >= beta) {
                this.hashTable.put(key, score + pos.maxScore - 2 * pos.minScore + 2);
                return score;
            }
            // Reducing the search windows to the new [alpha-beta]
            if (score > alpha) alpha = score;

            // continues to the next move
            nextMove = moves.getNext();
        }
        // Saving the upper bound for the position to the hashtable
        this.hashTable.put(key, alpha - pos.minScore + 1);
        return alpha;
    }

    solve(pos, weak = false) {
        this.nodeCount = 0;
        if (pos.canWinNext())
            return (pos.width * pos.height + 1 - pos.nbMoves) / 2;
        let min = -(pos.width * pos.height - pos.nbMoves) / 2;
        let max = (pos.width * pos.height + 1 - pos.nbMoves) / 2;
        if (weak) {
            min = -1;
            max = 1;
        }

        // iteratively narrowing the min and max
        // range of the search window
        while (min < max) {
            let med = min + (max - min) / 2;
            if (med <= 0 && min / 2 < med) med = min / 2;
            else if (med >= 0 && max / 2 > med) med = max / 2;
            const r = this.negamax(pos, med, med + 1);
            if (r <= med) max = r;
            else min = r;
        }
        return min;
    }

    analyze(position, weak = false) {
        let scores = new Array(position.width).fill(-1000);
        for (let col = 0; col < position.width; col++) {
            if (position.isPlayable(col)) {
                if (position.isWinningMove(col))
                    scores[col] = (position.width * position.height + 1 - position.nbMoves) / 2;
                else {
                    let position2 = position.clone();
                    position2.playCol(col);
                    scores[col] = -this.solve(position2, weak);
                }
            }
        }
        return scores;
    }


    /* "Private" Functions */
}

export default Solver;
