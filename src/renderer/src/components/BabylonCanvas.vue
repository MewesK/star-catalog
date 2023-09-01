<script setup lang="ts">
import { createScene } from '@renderer/babylon/GalaxyScene';
import { starsInRange } from '@renderer/state';
import { useDebounceFn, useResizeObserver } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';

const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContainerElement = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!canvasContainerElement.value) {
    return;
  }

  console.log('Waiting for stars to load...');

  watch(starsInRange, () => {
    if (!canvasElement.value) {
      return;
    }

    console.log('Initializing scene...', canvasElement.value.getBoundingClientRect());
    const engine = createScene(canvasElement.value);

    useResizeObserver(
      canvasContainerElement,
      useDebounceFn((entries) => {
        const canavsSize = entries[0].contentRect as DOMRectReadOnly;
        console.log(`Resizing canvas to ${canavsSize.width}x${canavsSize.height}...`);
        engine.setSize(canavsSize.width, canavsSize.height);
      }, 10)
    );
  });
});
</script>

<template>
  <div ref="canvasContainerElement" class="canvas-container">
    <canvas ref="canvasElement"></canvas>
  </div>
</template>

<style scoped>
.canvas-container {
  display: flex;
  height: 100%;
  background-color: black;
}

canvas {
  flex-grow: 1;
}
</style>
