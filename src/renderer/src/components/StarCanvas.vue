<script setup lang="ts">
import { CONTROLS_MOVEMENT_SPEED_DEFAULT, CONTROLS_MOVEMENT_SPEED_WARP } from '@renderer/defaults';
import { getStarName, isDev } from '@renderer/helper';
import { canvas, scene, selectStar, starsInRange } from '@renderer/state';
import { PointerEnterEvent } from '@renderer/three/SpaceScene';
import { screenToDevice } from '@renderer/three/helper';
import { useDebounceFn, useResizeObserver } from '@vueuse/core';
import { Star } from 'src/types/Star';
import { onMounted, ref, watch } from 'vue';

const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContainerElement = ref<HTMLElement | null>(null);

const currentStar = ref<Star | null>(null);
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

  canvas.initialize(canvasElement.value);
  canvas.stats.dom.classList.add('stats');
  canvas.stats.dom.hidden = !isDev;
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
    }, 10)
  );

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  scene.addEventListener('pointerenter', onPointerEnterStar as EventListener);
  scene.addEventListener('pointerleave', onPointerLeaveStar as EventListener);

  watch(starsInRange, initialize);
});

function initialize(): void {
  if (canvas === null) {
    return;
  }

  console.log('Initializing scene...');

  scene.initialize();
  scene.start();

  selectStar(starsInRange.value[0] as Star, true);
}

function onPointerEnterStar(event: PointerEnterEvent): void {
  if (!canvasElement.value || !canvas) {
    return;
  }
  currentStar.value = event.detail.star;
  showTooltip.value = true;
  tooltipText.value = getStarName(event.detail.star);
}

function onPointerLeaveStar(): void {
  currentStar.value = null;
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

function onPointerOver(): void {
  if (canvas.controls) {
    canvas.controls.controls.enabled = true;
  }
}

function onPointerOut(): void {
  if (canvas.controls) {
    canvas.controls.controls.enabled = false;
  }
}

function onKeyDown(event: KeyboardEvent): void {
  if (canvas.controls && event.key === 'Shift') {
    canvas.controls.controls.movementSpeed = CONTROLS_MOVEMENT_SPEED_WARP;
  }
}

function onKeyUp(event: KeyboardEvent): void {
  if (canvas.controls && event.key === 'Shift') {
    canvas.controls.controls.movementSpeed = CONTROLS_MOVEMENT_SPEED_DEFAULT;
  }
}

function onClick(): void {
  if (currentStar.value === null) {
    return;
  }
  selectStar(currentStar.value);
}
</script>

<template>
  <div ref="canvasContainerElement" class="canvas-container">
    <canvas
      ref="canvasElement"
      :style="{ cursor: showTooltip ? 'pointer' : 'auto' }"
      @pointermove.prevent="onPointerMove"
      @pointerout="onPointerOut"
      @pointerover="onPointerOver"
      @click.prevent="onClick"
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
