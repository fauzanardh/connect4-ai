<template>
  <div class="score-board">
    <div class="p1 cell">
      <p :style="{color:redHex}">RED</p>
<!--      <p v-if="isPlayerRed">(your turn)</p>-->
    </div>
    <div class="status cell">
      <p v-if="gameOver">
        {{ messageOver }}
        <a href="#app" @click="reset">Play Again</a>
      </p>
      <p v-else>
        {{ currentPlayer }}
      </p>
    </div>
    <div class="p2 cell">
      <p :style="{color:blackHex}">BLACK</p>
<!--      <p v-if="isPlayerBlack">(your turn)</p>-->
    </div>
  </div>
</template>

<script>
import {HEXES, BLACK, RED, OVER} from '@/constants';
import {makeTitle} from "@/utils";

export default {
  name: "GameScoreBoard",
  props: ['winner', 'moves', 'playerColor', 'status'],

  computed: {
    redHex() {
      return HEXES.red;
    },
    blackHex() {
      return HEXES.black;
    },
    winnerName() {
      return this.winner && makeTitle(this.winner.color);
    },
    isPlayerRed() {
      return this.playerColor === RED;
    },
    isPlayerBlack() {
      return this.playerColor === BLACK;
    },
    gameOver() {
      return this.status === OVER;
    },
    messageOver() {
      if (this.winner) {
        return `${makeTitle(this.winner.color)} wins!`;
      }
      return 'It\'s a draw!';
    },
    currentPlayer() {
      return `${makeTitle(this.playerColor)}'s turn.`;
    }
  },

  methods: {
    reset() {
      this.$emit('reset');
    }
  }
}
</script>

<style scoped>
.score-board {
  width: 480px;
  display: grid;
  grid-template-columns: [p1] 25% [status] 50% [p2] 25%;
  margin: 0 auto;
  padding: 1em 0;
  font-weight: bold;
}
.score-board .status {
  font-weight: normal;
}
</style>
