<script setup lang="ts">
import { ref, onMounted, reactive, watchEffect } from 'vue';
import { useDebounceFn, useResizeObserver } from '@vueuse/core';
import { resize, initialize, initializeScene, stats } from '@renderer/three';

const env = reactive({ ...window.electron.process.env });

const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContainerElement = ref<HTMLElement | null>(null);
const isDev = env.NODE_ENV_ELECTRON_VITE === 'development';

useResizeObserver(
  canvasContainerElement,
  useDebounceFn((entries) => {
    console.log('Resizing canavs...');
    const { width, height } = entries[0].contentRect;
    resize(width, height);
  }, 100)
);

onMounted(async () => {
  if (!canvasElement.value || !canvasContainerElement.value) {
    return;
  }

  const { width, height } = canvasContainerElement.value.getBoundingClientRect();
  initialize(canvasElement.value, width, height);
  stats.dom.classList.add('stats');
  canvasContainerElement.value.appendChild(stats.dom);

  watchEffect(() => {
    console.log('Initializing scene...');
    initializeScene(isDev);
  });
});
</script>

<template>
  <div ref="canvasContainerElement" class="container">
    <canvas ref="canvasElement" class="canvas"></canvas>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  height: 100%;
  background-color: black;
}
canvas {
  flex-grow: 1;
  height: 100%;
}
:deep(.stats) {
  position: absolute !important;
}
</style>
