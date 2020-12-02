<template>
  <div id="app">
    <div class="logo">
<!--      <img alt="Connect 4 AI" src="./assets/logo.png">-->
      <h2>Connect 4 AI</h2>
    </div>
    <GameContainer/>
    <footer>
      Connect 4 AI | Project for BINUS International Analysis of Algorithm class
    </footer>
  </div>
</template>

<script>
import GameContainer from "@/components/GameContainer";

export default {
  name: 'App',
  components: {
    GameContainer
  },

  methods: {
    async update() {
      this.prompt = false;
      await this.$workbox.messageSW({ type: "SKIP_WAITING" });
    }
  },

  data() {
    return {
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
  background-color: #f0ffff;
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
