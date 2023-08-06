<script setup lang="ts">
import { reactive } from 'vue';
import { stars } from '../stars';

const versions = reactive({ ...window.electron.process.versions });
const env = reactive({ ...window.electron.process.env });
</script>

<template>
  <ul>
    <li>Electron v{{ versions.electron }}</li>
    <li>Chromium v{{ versions.chrome }}</li>
    <li>Node v{{ versions.node }}</li>
    <li>V8 v{{ versions.v8 }}</li>
    <li>{{ stars.length }} stars loaded</li>
    <li>{{ env.NODE_ENV_ELECTRON_VITE ?? 'production' }}</li>
  </ul>
</template>

<style scoped>
ul {
  list-style: none;
  margin: 0;
}

li {
  display: inline-block;
  opacity: 0.8;
  padding: 0 0.5rem;
}

li:not(:last-child) {
  border-right: 1px solid black;
}
</style>
