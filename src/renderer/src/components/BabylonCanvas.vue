<script setup lang="ts">
import { isDev } from '@renderer/helper';
import { createGalaxy, selectStar, starsInRange } from '@renderer/state';
import { useDebounceFn, useElementSize, useParentElement, useResizeObserver } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';

const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContainerElement = ref<HTMLElement | null>(null);
const { width: parentWidth, height: parentHeight } = useElementSize(useParentElement());

if (isDev) {
  import.meta.hot?.on('vite:afterUpdate', (): void => window.location.reload());
}

onMounted(() => {
  console.log('Waiting for stars to load...');

  const galaxy = createGalaxy(canvasElement.value as HTMLCanvasElement);

  useResizeObserver(
    canvasContainerElement,
    useDebounceFn((entries) => {
      const canavsSize = entries[0].contentRect as DOMRectReadOnly;
      console.log(`Resizing canvas to ${canavsSize.width}x${canavsSize.height}...`);
      galaxy.engine.setSize(canavsSize.width, canavsSize.height);
    }, 10)
  );

  watch(starsInRange, () => {
    console.log('Initializing scene...');
    galaxy.initialize();
    galaxy.engine.setSize(parentWidth.value, parentHeight.value);
    selectStar(starsInRange.value[0], true);
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
  height: 100%;
  display: flex;
  background-color: black;
}

canvas {
  flex-grow: 1;
}
</style>
