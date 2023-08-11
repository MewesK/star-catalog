<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';
import { useDebounceFn, useResizeObserver } from '@vueuse/core';
import { resize, initialize, initializeScene, start, stats, updatePointer } from '@renderer/three';

const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContainerElement = ref<HTMLElement | null>(null);

useResizeObserver(
  canvasContainerElement,
  useDebounceFn((entries) => {
    console.log('Resizing canavs...');
    resize(entries[0].contentRect.width, entries[0].contentRect.height);

    // Start animation loop if necessary
    if (start(onIntersect)) {
      console.log('Started animation loop.');
    }
  }, 100)
);

onMounted(async () => {
  if (!canvasElement.value || !canvasContainerElement.value) {
    return;
  }

  console.log('Initializing canvas...');
  initialize(canvasElement.value);

  // Mount stats
  stats.dom.classList.add('stats');
  canvasContainerElement.value.appendChild(stats.dom);

  // Wait for stars to load
  watchEffect(() => {
    console.log('Initializing scene...');
    initializeScene();
  });
});

function onIntersect(starIndex: number, intersection: THREE.Intersection<THREE.Object3D>): void {
  console.log('Intersecting...', starIndex, intersection);
}

function onPointerMove(event: PointerEvent): void {
  if (!canvasElement.value) {
    return;
  }
  const canvasBoundingRect = canvasElement.value.getBoundingClientRect();
  updatePointer(event.clientX - canvasBoundingRect.x, event.clientY - canvasBoundingRect.y);
}
</script>

<template>
  <div ref="canvasContainerElement" class="container">
    <canvas ref="canvasElement" class="canvas" @pointermove.prevent="onPointerMove"></canvas>
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
  top: inherit !important;
  left: inherit !important;
  bottom: 22px;
  right: 0;
}
</style>
