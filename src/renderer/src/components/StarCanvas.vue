<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDebounceFn, useResizeObserver, watchArray } from '@vueuse/core';
import Canvas from '@renderer/three/Canvas';
import PointScene from '@renderer/three/PointScene';
import { getStarName, selectedStars, stars } from '@renderer/stars';
import { screenToDevice } from '@renderer/three/helper';
import { isDev } from '@renderer/helper';

const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContainerElement = ref<HTMLElement | null>(null);

let canvas = null as Canvas | null;
let scene = null as PointScene | null;

const showTooltip = ref(false);
const tooltipText = ref<string | null>(null);

// DEBUG
if (isDev) {
  import.meta.hot?.on('vite:afterUpdate', initialize);
}

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

function onPointerEnter(starIndex: number): void {
  if (!canvasElement.value || !canvas) {
    return;
  }

  showTooltip.value = true;
  tooltipText.value = getStarName(selectedStars.value[starIndex]);
}

function onPointerLeave(): void {
  showTooltip.value = false;
  tooltipText.value = null;
}

function onPointerMove(event: PointerEvent): void {
  if (!canvasElement.value || !scene?.raycaster) {
    return;
  }
  const worldCoordinates = screenToDevice(
    event.clientX,
    event.clientY,
    canvasElement.value.getBoundingClientRect()
  );
  scene.raycaster.updatePointer(worldCoordinates.x, worldCoordinates.y);
}
</script>

<template>
  <div ref="canvasContainerElement" class="canvas-container">
    <canvas
      ref="canvasElement"
      class="canvas"
      :style="{ cursor: showTooltip ? 'pointer' : 'auto' }"
      @pointermove.prevent="onPointerMove"
    ></canvas>
    <v-snackbar
      v-model="showTooltip"
      attach
      location="top"
      rounded="pill"
      :timeout="-1"
      style="margin-top: 80px"
    >
      {{ tooltipText }}
    </v-snackbar>
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

:deep(.v-snackbar__content) {
  text-align: center;
  font-weight: bold;
}
</style>
