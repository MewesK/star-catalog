<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { resize, initialize, stats } from '../three';

const env = reactive({ ...window.electron.process.env });

const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContainerElement = ref<HTMLElement | null>(null);

onMounted(async () => {
  if (!canvasElement.value || !canvasContainerElement.value) {
    return;
  }

  const { width, height } = canvasContainerElement.value.getBoundingClientRect();
  initialize(canvasElement.value, width, height, env.NODE_ENV_ELECTRON_VITE === 'development');
  stats.dom.classList.add('stats');
  canvasContainerElement.value.appendChild(stats.dom);

  // Resize renderer if necessary
  window.addEventListener(
    'resize',
    () => {
      if (canvasContainerElement.value) {
        const { width, height } = canvasContainerElement.value.getBoundingClientRect();
        resize(width, height);
      }
    },
    false
  );
});
</script>

<template>
  <div ref="canvasContainerElement" class="canvas-container">
    <canvas ref="canvasElement"></canvas>
  </div>
</template>

<style scoped>
.canvas-container {
  flex-grow: 1;
  position: relative;
}
:deep(.stats) {
  position: absolute !important;
}
</style>
