<template>
  <transition
    :css="false"
    @enter="enter"
    appear
  >
    <circle
      :cx="centerX"
      :cy="centerY"
      :r="radius"
      :fill="fillColor"
      :fill-opacity="opacity"
    />
  </transition>
</template>

<script>
import {TweenMax, Bounce} from 'gsap';

import {OVER, HEXES} from '@/constants';

export default {
  name: "GameCheckers",
  props: ['checker', 'cellSize', 'rowCount', 'radius', 'status'],

  data() {
    return {
      minDuration: 0.2,
      coefficient: 0.4,
    };
  },

  computed: {
    row() {
      return this.checker.row;
    },
    col() {
      return this.checker.col;
    },
    centerX() {
      return this.cellSize / 2;
    },
    centerY() {
      return this.cellSize / 2 + this.cellSize * (this.rowCount - 1 - this.row);
    },
    fromY() {
      return -1 * (this.centerY + this.cellSize);
    },
    destY() {
      return 0;
    },
    isWinner() {
      return this.checker.isWinner;
    },
    color() {
      return this.checker.color;
    },
    fillColor() {
      return HEXES[this.color];
    },
    opacity() {
      return this.status === OVER && !this.isWinner ? 0.3 : 1.0;
    },
    percentage() {
      return (this.rowCount - this.row) / this.rowCount;
    }
  },

  methods: {
    duration() {
      const {minDuration, coefficient, rowCount, row} = this;
      const percentage = (rowCount - row) / rowCount;
      return minDuration + coefficient * percentage;
    },

    enter(el, done) {
      const fromY = -1 * (this.centerY + this.cellSize);
      const destY = 0;
      const fromParams = {
        y: fromY,
      };
      const destParams = {
        y: destY,
        ease: Bounce.easeOut,
        onComplete: () => {
          this.$emit('land');
          done();
        },
      };
      return TweenMax.fromTo(el, this.duration(), fromParams, destParams);
    },
  }
}
</script>
