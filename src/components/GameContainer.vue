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
      :current-color="currentColor"
      :status="status"
      @reset="reset"
    />
  </div>
</template>

<script>
import Vue from 'vue';

import {min, max, key} from '@/utils';
import {AI, YOU, EMPTY, PLAY, OVER} from '@/constants';
import GameBoard from '@/components/GameBoard';
import GameScoreBoard from '@/components/GameScoreBoard';
import Position from '@/AI/Position';
import Solver from '@/AI/Solver';

const WIDTH = 7;
const HEIGHT = 6;

export default {
  name: 'GameContainer',
  components: {
    GameBoard,
    GameScoreBoard
  },

  data() {
    return {
      checkers: {},
      isLocked: false,
      currentColor: AI,
      rowCount: HEIGHT,
      colCount: WIDTH,
      status: PLAY,
      instruction: 'Click one of the columns to play!',
      winner: undefined,
      // AI stuff
      isAITurn: true,
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

  created() {
    if (this.isAITurn) {
      const ret = this.solver.solve(this.position);
      const column = ret.col;
      const colCheckers = Object.values(this.checkers)
          .filter(c => c.col === ret.col)
          .sort((a, b) => a.row - b.row);
      const lastRow = Math.max(...colCheckers.map(c => c.row).concat(-1)) + 1;
      this.drop({col: column, row: lastRow})
      this.isAITurn = false;
    }
  },

  methods: {
    key,
    reset() {
      window.history.go(0);
      // this.winner = undefined;
      // this.isLocked = false;
      // this.status = PLAY;
      // this.checkers = {};
      // this.isAITurn = true;
      // this.position = new Position(WIDTH, HEIGHT);
      // this.solver = new Solver(WIDTH);
      // const ret = this.solver.solve(this.position);
      // if (ret.col === -1 && ret.val === -10000) {
      //   this.resigned(this.playerColor);
      // } else {
      //   const colCheckers = Object.values(this.checkers)
      //       .filter(c => c.col === ret.col)
      //       .sort((a, b) => a.row - b.row);
      //   const lastRow = Math.max(...colCheckers.map(c => c.row).concat(-1)) + 1;
      //   this.drop({col:ret.col, row:lastRow})
      //   this.isAITurn = false;
      // }
    },
    toggleColor() {
      if (this.currentColor === AI) {
        this.currentColor = YOU;
      } else {
        this.currentColor = AI;
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
      if (this.isLocked) return;
      this.isLocked = true;
      const color = this.currentColor;
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
        const ret = this.solver.solve(this.position);
        if (ret.col === -1 && ret.val === -10000) {
          this.resigned(this.currentColor);
        } else {
          const colCheckers = Object.values(this.checkers)
              .filter(c => c.col === ret.col)
              .sort((a, b) => a.row - b.row);
          const lastRow = Math.max(...colCheckers.map(c => c.row).concat(-1)) + 1;
          this.drop({col:ret.col, row:lastRow})
          this.isAITurn = false;
        }
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
      this.winner.checkers.forEach((checker) => {
        this.setChecker(checker, {isWinner: true});
      });
    },
    resigned(player){
      this.winner = {color: player === AI ? YOU : AI};
      this.status = OVER;
    }
  }
}
</script>
