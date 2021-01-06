<template>
  <div id="app">
    <div class="logo">
      <img alt="Connect 4 AI" src="img/logo.png">
      <h2>Connect 4 AI</h2>
    </div>
    <div v-if="isReady" id="game">
      <component :is="gameContainerName" v-bind="gameContainerProps"/>
    </div>
    <div v-else>
      <h3>Who gets the first turn?</h3>
      <button class="btn" type="button" v-on:click="setPlayer('ai')" style="margin:8px">AI</button>
      <button class="btn" type="button" v-on:click="setPlayer('you')" style="margin:8px">You</button>
      <br/>
      <br/>
    </div>
    <footer>
      Connect 4 AI | Project for BINUS International Analysis of Algorithm class
    </footer>
  </div>
</template>

<script>
import GameContainer from "@/components/GameContainer";
import {AI, YOU} from '@/constants';

export default {
  name: 'App',

  components: {
    GameContainer
  },

  computed: {
    gameContainerName() {
      return "GameContainer";
    },
    gameContainerProps() {
      return {firstPlayer: this.currentPlayer};
    }
  },

  methods: {
    async update() {
      this.prompt = false;
      await this.$workbox.messageSW({ type: "SKIP_WAITING" });
    },
    setPlayer(player) {
      if (player === "ai")
        this.currentPlayer = AI;
      else if (player === "you")
        this.currentPlayer = YOU;
      if (this.currentPlayer)
        this.isReady = true;
    },
  },

  data() {
    return {
      currentPlayer: undefined,
      isReady: false,
      prompt: false
    };
  },

  created() {
    if (this.$workbox) {
      this.$workbox.addEventListener("waiting", () => {
        this.prompt = true;
      });
    }
  }
}
</script>

<style>
body {
  background-color: #121212;
}
a {
  text-decoration: none;
}
.logo {
  display: inline-block;
}
.logo h3 {
  margin: 0;
}
.btn {
  background-color: #BB86FC;
  border-radius: 6px;
  color: #000;
  padding: 12px 24px;
  transition-timing-function: ease-in;
  transition-property: background-color;
  transition-duration: 100ms;
}
.btn:hover {
  background-color: #C89EFC;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #e6e6e7;
  margin-top: 60px;
}
</style>
