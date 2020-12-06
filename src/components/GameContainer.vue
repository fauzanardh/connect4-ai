<template>
  <div>
    <p>
      {{ instruction }}
    </p>
    <GameBoard
      :checkers="checkers"
      :row-count="rowCount"
      :col-count="colCount"
      :status="status"
      @drop="drop"
      @land="land"
    />
    <GameScoreBoard
      :moves="moves"
      :winner="winner"
      :player-color="playerColor"
      :status="status"
      @reset="reset"
    />
  </div>
</template>

<script>
import Vue from 'vue';

import {min, max, key} from '@/utils';
import {RED, BLACK, EMPTY, PLAY, OVER} from '@/constants';
import GameBoard from '@/components/GameBoard';
import GameScoreBoard from '@/components/GameScoreBoard';
import Position from '@/AI/Position';
import Solver from '@/AI/Solver';

const WIDTH = 7;
const HEIGHT = 6;

export default {
  name: "GameContainer",
  components: {
    GameBoard,
    GameScoreBoard
  },

  data() {
    return {
      checkers: {},
      isLocked: false,
      playerColor: RED,
      rowCount: HEIGHT,
      colCount: WIDTH,
      status: PLAY,
      instruction: 'Click one of the columns to play!',
      winner: undefined,
      // AI stuff
      isAITurn: false,
      position: new Position(WIDTH, HEIGHT),
      solver: new Solver(WIDTH),
    };
  },

  computed: {
    moves() {
      return Object.values(this.checkers);
    },
    gameOver() {
      return this.status === OVER;
    },
    isDraw() {
      return Object.keys(this.checkers).length === this.rowCount * this.colCount;
    }
  },

  methods: {
    key,
    reset() {
      this.winner = undefined;
      this.isLocked = false;
      this.status = PLAY;
      this.checkers = {};
      this.position = new Position(WIDTH, HEIGHT);
      this.solver = new Solver(WIDTH);
    },
    toggleColor() {
      if (this.playerColor === RED) {
        this.playerColor = BLACK;
      } else {
        this.playerColor = RED;
      }
    },
    getChecker({row, col}) {
      return this.checkers[key(row,col)] || {row, col, color: 'empty'};
    },
    setChecker({row, col}, attrs = {}) {
      const checker = this.getChecker({row, col});
      return Vue.set(this.checkers, key(row, col), {...checker, ...attrs});
    },
    drop({col, row}) {
      this.instruction = 'Click one of the columns to play!';
      if (this.isLocked) return;
      this.isLocked = true;
      const color = this.playerColor;
      this.setChecker({row, col}, {color});
      this.position.playCol(col);
      if (!this.isDraw) this.checkForWinFrom({row, col});
      if (!this.isAITurn)
        this.isAITurn = true;
    },
    land() {
      if (this.isDraw) return this.displayDraw;
      if (this.winner) {
        this.displayWin(this.winner);
      } else {
        this.isLocked = false;
        this.toggleColor();
      }
      if (this.isAITurn && !this.winner) {
        this.instruction = "Please wait...";
        const column = this.solver.solve(this.position).col;
        const colCheckers = Object.values(this.checkers)
            .filter(c => c.col === column)
            .sort((a, b) => a.row - b.row);
        const lastRow = Math.max(...colCheckers.map(c => c.row).concat(-1)) + 1;
        this.drop({col:column, row:lastRow})
        this.isAITurn = false;
        // let column = 0;
        // let score = Number.NEGATIVE_INFINITY;
        // this.solver.columnExpOrder.forEach((item) => {
        //   // Cloning the position class so it
        //   // doesn't interfere with the original one
        //   // *Hacky but it works*
        //   const pos = Object.assign(
        //       Object.create(Object.getPrototypeOf(this.position)),
        //       JSON.parse(JSON.stringify(this.position, (key, value) =>
        //           typeof value === 'bigint' ? value.toString() : value))
        //   );
        //   // Restoring the vars back to bigint datatype
        //   /* eslint-disable */
        //   pos.current_pos = BigInt(pos.current_pos);
        //   pos.mask = BigInt(pos.mask);
        //   pos.bottomMask = BigInt(pos.bottomMask);
        //   pos.boardMask = BigInt(pos.boardMask);
        //   /* eslint-enable */
        //   pos.playCol(item);
        //   const newScore = this.solver.solve(pos);
        //   console.log(this.solver.nodeCount);
        //   if (newScore > score) {
        //     score = newScore;
        //     column = item;
        //   }
        // });
        // const colCheckers = Object.values(this.checkers)
        //     .filter(c => c.col === column)
        //     .sort((a, b) => a.row - b.row);
        // const lastRow = Math.max(...colCheckers.map(c => c.row).concat(-1)) + 1;
        // this.drop({col:column, row:lastRow})
      }
    },
    getWinner(...segment) {
      if (segment.length !== 4) return false;
      const checkers = segment.map(([row, col]) => this.getChecker({row, col}));
      const [{color}] = checkers;
      if (color === EMPTY) return false;
      return checkers.every(c => c.color === color) && {color, checkers};
    },
    checkHorizontalSegments({ focalRow, minCol, maxCol }) {
      let winner;
      for (let row = focalRow, col = minCol; col <= maxCol; col++) {
        winner = this.getWinner(
            [row, col], [row, col + 1], [row, col + 2], [row, col + 3]);
        if (winner) return winner;
      }
    },
    checkVerticalSegments({ focalRow, focalCol, minRow }) {
      let winner;
      for (let col = focalCol, row = minRow; row <= focalRow; row++) {
        winner = this.getWinner(
            [row, col], [row + 1, col], [row + 2, col], [row + 3, col]);
        if (winner) return winner;
      }
    },
    checkForwardSlashSegments({ focalRow, focalCol, minRow, minCol, maxRow, maxCol }) {
      const startForwardSlash = (row, col) => {
        while (row > minRow && col > minCol) { row--; col--; }
        return [row, col];
      };
      let winner;
      for (let [row, col] = startForwardSlash(focalRow, focalCol);
           row <= maxRow && col <= maxCol; row++, col++) {
        winner = this.getWinner(
            [row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]);
        if (winner) return winner;
      }
    },
    checkBackwardSlashSegments({ focalRow, focalCol, minRow, minCol, maxRow, maxCol }) {
      const startBackwardSlash = (row, col) => {
        while (row < maxRow && col > minCol) { row++; col--; }
        return [row, col];
      };
      let winner;
      for (let [row, col] = startBackwardSlash(focalRow, focalCol);
           row >= minRow && col <= maxCol; row--, col++) {
        winner = this.getWinner(
            [row, col], [row - 1, col + 1], [row - 2, col + 2], [row - 3, col + 3]);
        if (winner) return winner;
      }
    },
    checkForWinFrom(lastChecker) {
      if (!lastChecker) return;
      const { row: focalRow, col: focalCol } = lastChecker;
      const minCol = min(focalCol);
      const maxCol = max(focalCol, this.colCount - 1);
      const minRow = min(focalRow);
      const maxRow = max(focalRow, this.rowCount - 1);
      const coords = { focalRow, focalCol, minRow, minCol, maxRow, maxCol };
      this.winner = this.checkHorizontalSegments(coords) ||
          this.checkVerticalSegments(coords) ||
          this.checkForwardSlashSegments(coords) ||
          this.checkBackwardSlashSegments(coords);
    },
    displayDraw() {
      this.status = OVER;
    },
    displayWin(winner){
      this.winner = winner;
      this.status = OVER;
      this.position = new Position(HEIGHT, WIDTH);
      this.solver = new Solver(WIDTH);
      this.winner.checkers.forEach((checker) => {
        this.setChecker(checker, {isWinner: true});
      });
    }
  }
}
</script>
