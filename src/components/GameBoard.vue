<template>
 <svg
  :viewBox="`0 0 ${boardWidth} ${boardHeight}`"
  xmlns="http://www.w3.org/2000/svg"
  class="game-board"
 >
  <defs>
    <pattern :id="patternId" patternUnits="userSpaceOnUse" :width="cellSize" :height="cellSize">
      <circle :cx="cellSize / 2" :cy="cellSize / 2" :r="radius" fill="black"/>
    </pattern>
   <mask :id="maskId">
     <rect :width="cellSize" :height="boardHeight" fill="white"/>
     <rect :width="cellSize" :height="boardHeight" :fill="pattern"/>
   </mask>
  </defs>
   <GameColumns
     v-for="col in cols"
     :key="col"
     :checkers="colCheckers(col)"
     :col="col"
     :color="columnsColor"
     :cell-size="cellSize"
     :radius="radius"
     :board-height="boardHeight"
     :row-count="rowCount"
     :mask="mask"
     :status="status"
     @drop="drop"
     @land="land"
   />
 </svg>
</template>

<script>
import {cssUrl, range} from "@/utils";
import GameColumns from "@/components/GameColumns";
import {HEXES} from "@/constants";

export default {
  components: {
    GameColumns
  },
  name: "GameBoard",
  props: ['checkers', 'rowCount', 'colCount', 'status'],

  data() {
    return {
      patternId: 'cell-pattern',
      maskId: 'cell-mask',
      cellSize: 100,
    };
  },

  computed: {
    pattern() {
      return cssUrl(this.patternId);
    },
    mask() {
      return cssUrl(this.maskId);
    },
    rows() {
      return range(this.rowCount);
    },
    cols() {
      return range(this.colCount);
    },
    boardWidth() {
      return this.colCount * this.cellSize;
    },
    boardHeight() {
      return this.rowCount * this.cellSize;
    },
    radius() {
      return this.cellSize * 0.45;
    },
    columnsColor() {
      return HEXES.columns;
    }
  },

  methods: {
    colCheckers(col) {
      return Object.values(this.checkers)
      .filter(c => c.col === col)
      .sort((a, b) => a.row - b.row);
    },
    drop(data) {
      this.$emit('drop', data);
    },
    land() {
      this.$emit('land');
    }
  }
}
</script>

<style scoped>
.game-board {
  border: 5px #473E53 solid;
  margin: 0 auto;
  width: 80%;
  max-width: 420px;
}
</style>
