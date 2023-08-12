<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDebounceFn, useResizeObserver, watchArray } from '@vueuse/core';
import Canvas from '@renderer/three/Canvas';
import PointScene from '@renderer/three/PointScene';
import { stars } from '@renderer/stars';

const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContainerElement = ref<HTMLElement | null>(null);

let canvas = null as Canvas | null;
let scene = null as PointScene | null;

onMounted(() => {
  if (!canvasElement.value || !canvasContainerElement.value) {
    return;
  }

  console.log('Initializing canvas...');

  canvas = new Canvas(canvasElement.value);
  canvas.stats.dom.classList.add('stats');
  canvasContainerElement.value.appendChild(canvas.stats.dom);

  useResizeObserver(
    canvasContainerElement,
    useDebounceFn((entries) => {
      if (canvas === null) {
        return;
      }

      console.log('Resizing canvas...');
      canvas.resize(entries[0].contentRect.width, entries[0].contentRect.height);
    }, 100)
  );

  watchArray(stars, () => {
    if (canvas === null) {
      return;
    }

    console.log('Initializing scene...');

    scene = new PointScene(canvas);
    scene.pointerEnterCallback = onPointerEnter;
    scene.pointerLeaveCallback = onPointerLeave;

    scene.initialize();
    scene.start();
  });
});

function onPointerEnter(starIndex: number, intersection: THREE.Intersection<THREE.Object3D>): void {
  console.log('onPointerEnter...', starIndex, intersection);
}

function onPointerLeave(starIndex: number): void {
  console.log('onPointerLeave...', starIndex);
}

function onPointerMove(event: PointerEvent): void {
  if (!canvasElement.value || !scene?.raycaster) {
    return;
  }
  const bounds = canvasElement.value.getBoundingClientRect();
  scene.raycaster.updatePointer(
    ((event.clientX - bounds.x) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.y) / bounds.height) * 2 + 1
  );
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
