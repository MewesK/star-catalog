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
  margin: 0 auto;
  float: none;
  clear: both;
  overflow: hidden;
  font-family: 'Menlo', 'Lucida Console', monospace;
  color: #c2f5ff;
  line-height: 1;
  transition: all 0.3s;
}

li {
  display: block;
  float: left;
  border-right: 1px solid rgba(194, 245, 255, 0.4);
  padding: 0 20px;
  font-size: 13px;
  opacity: 0.8;
}

li:last-child {
  border: none;
}
</style>
