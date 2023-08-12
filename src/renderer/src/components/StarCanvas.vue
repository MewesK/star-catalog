<script setup lang="ts">
import * as THREE from 'three';
import { ref, onMounted } from 'vue';
import { useDebounceFn, useResizeObserver, watchArray } from '@vueuse/core';
import Canvas from '@renderer/three/Canvas';
import PointScene from '@renderer/three/PointScene';
import { getStarName, selectedStars, stars } from '@renderer/stars';
import { screenToWorld, worldToScreen } from '@renderer/three/helper';

const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContainerElement = ref<HTMLElement | null>(null);

let canvas = null as Canvas | null;
let scene = null as PointScene | null;

const showTooltip = ref(false);
const tooltipText = ref<string | null>(null);
const tooltipPositionTop = ref('0');
const tooltipPositionLeft = ref('0');

// DEBUG
import.meta.hot?.on('vite:afterUpdate', initialize);

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

      console.log(
        `Resizing canvas to ${entries[0].contentRect.width}x${entries[0].contentRect.height}...`
      );
      canvas.resize(entries[0].contentRect.width, entries[0].contentRect.height);
    }, 100)
  );

  watchArray(stars, initialize);
});

function initialize(): void {
  if (canvas === null) {
    return;
  }

  console.log('Initializing scene...');

  scene = new PointScene(canvas);
  scene.pointerEnterCallback = onPointerEnter;
  scene.pointerLeaveCallback = onPointerLeave;

  scene.initialize();
  scene.start();
}

function onPointerEnter(starIndex: number, intersection: THREE.Intersection<THREE.Object3D>): void {
  if (!canvasElement.value || !canvas) {
    return;
  }

  const projectedPoint = intersection.point.project(canvas.camera);
  const screenCoordinates = worldToScreen(
    projectedPoint.x,
    projectedPoint.y,
    canvasElement.value.getBoundingClientRect()
  );

  showTooltip.value = true;
  tooltipPositionTop.value = `${screenCoordinates.y + 10}px`;
  tooltipPositionLeft.value = `${screenCoordinates.x + 10}px`;
  tooltipText.value = getStarName(selectedStars.value[starIndex]);
}

function onPointerLeave(): void {
  showTooltip.value = false;
  tooltipPositionTop.value = '0';
  tooltipPositionLeft.value = '0';
  tooltipText.value = null;
}

function onPointerMove(event: PointerEvent): void {
  if (!canvasElement.value || !scene?.raycaster) {
    return;
  }
  const worldCoordinates = screenToWorld(
    event.clientX,
    event.clientY,
    canvasElement.value.getBoundingClientRect()
  );
  scene.raycaster.updatePointer(worldCoordinates.x, worldCoordinates.y);
}
</script>

<template>
  <div ref="canvasContainerElement" class="canvas-container">
    <canvas ref="canvasElement" class="canvas" @pointermove.prevent="onPointerMove"></canvas>
    <div
      v-show="showTooltip"
      :style="{ top: tooltipPositionTop, left: tooltipPositionLeft }"
      role="tooltip"
      class="canvas-tooltip"
    >
      {{ tooltipText }}
    </div>
  </div>
</template>

<style scoped>
.canvas-container {
  display: flex;
  height: 100%;
  background-color: black;
}

.canvas-tooltip {
  position: absolute;
  z-index: 2000;
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
