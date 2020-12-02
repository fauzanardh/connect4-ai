<template>
  <svg :x="col * cellSize" y="0">
    <g @click="drop(col)" class="column">
      <GameCheckers
        v-for="checker in checkers"
        :key="key(checker)"
        :checker="checker"
        :cell-size="cellSize"
        :rowCount="rowCount"
        :radius="radius"
        :status="status"
        @land="land"
      />
      <rect
        :class="status"
        :key="col"
        :col="col"
        :width="cellSize"
        :height="boardHeight"
        :fill="color"
        :fill-opacity="opacity"
        :mask="mask"
      />
    </g>
  </svg>
</template>

<script>
import {OVER} from '@/constants';
import GameCheckers from "@/components/GameCheckers";
export default {
  name: "GameColumns",
  components: {
    GameCheckers,
  },

  props: ['checkers', 'col', 'color', 'cellSize', 'boardHeight', 'radius', 'rowCount', 'mask', 'status'],

  computed: {
    // Finding the next open empty row
    nextEmptyRow() {
      return Math.max(...this.checkers.map(c => c.row).concat(-1)) + 1;
    },
    opacity() {
      return this.status === OVER ? 0.25 : 1.0;
    }
  },

  methods: {
    key({row, col}) {
      return `${row}${col}`;
    },
    land() {
      this.$emit('land');
    },
    drop(col) {
      const row = this.nextEmptyRow;
      if (row < this.rowCount) {
        this.$emit('drop', {row, col});
      }
    }
  }
}
</script>

<style scoped>
.column {
  cursor: pointer;
}
</style>
