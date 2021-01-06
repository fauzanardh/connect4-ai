<template>
  <div class="score-board">
    <div class="p1 cell">
      <p :style="{color:aiHex}">AI</p>
    </div>
    <div class="status cell">
      <p v-if="gameOver">
        {{ messageOver }}
        <a class="play" href="#app" @click="reset">Play Again</a>
      </p>
      <p v-else>
        {{ currentPlayerTurnString }}
      </p>
    </div>
    <div class="p2 cell">
      <p :style="{color:youHex}">You</p>
    </div>
  </div>
</template>

<script>
import {HEXES, YOU, OVER} from '@/constants';
import {makeTitle} from "@/utils";

export default {
  name: "GameScoreBoard",
  props: ['winner', 'moves', 'currentPlayer', 'status'],

  computed: {
    aiHex() {
      return HEXES.ai;
    },
    youHex() {
      return HEXES.you;
    },
    winnerName() {
      return this.winner && makeTitle(this.winner.color);
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
    currentPlayerTurnString() {
      if (this.currentPlayer === YOU) {
        return 'Your turn.';
      } else {
        return 'AI\'s turn';
      }
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
.play {
  color: #CF6679;
}
.score-board {
  width: 240px;
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
