<script setup lang="ts">
import StarBrowser from './components/StarBrowser.vue';
import StarCanvas from './components/StarCanvas.vue';
import StarDetails from './components/StarDetails.vue';
import Debug from './components/Debug.vue';
</script>

<template>
  <div class="container">
    <header>
      <StarDetails></StarDetails>
    </header>
    <main>
      <div class="canvas">
        <StarCanvas></StarCanvas>
      </div>
      <div class="browser">
        <StarBrowser></StarBrowser>
      </div>
    </main>
    <footer>
      <Debug></Debug>
    </footer>
  </div>
</template>

<style>
@import './styles.css';

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header,
footer {
  background-color: darkslategrey;
}

main {
  display: flex;
  flex-grow: 1;
  height: 0;
}

.canvas {
  display: flex;
  flex-grow: 1;
}

.browser {
  overflow-x: auto;
  overflow-y: scroll;
  max-width: 40vw;
}
</style>
