<script setup lang="ts">
import { PointerInfo } from '@babylonjs/core';
import { getStarName, isDev } from '@renderer/helper';
import { createGalaxy, selectStar, starsInRange } from '@renderer/state';
import { useDebounceFn, useElementSize, useParentElement, useResizeObserver } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';

import { StarSprite } from '../babylon/StarSprite';

const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContainerElement = ref<HTMLElement | null>(null);
const { width: parentWidth, height: parentHeight } = useElementSize(useParentElement());

const showTooltip = ref(false);
const tooltipText = ref<string | null>(null);

if (isDev) {
  import.meta.hot?.on('vite:afterUpdate', (): void => window.location.reload());
}

onMounted(() => {
  console.log('Waiting for stars to load...');

  const galaxy = createGalaxy(canvasElement.value as HTMLCanvasElement);
  galaxy.galacticScene.scene.onPointerObservable.add((pointerInfo: PointerInfo): void => {
    if (pointerInfo.pickInfo?.hit && pointerInfo.pickInfo?.pickedSprite) {
      showTooltip.value = true;
      tooltipText.value = getStarName((pointerInfo.pickInfo.pickedSprite as StarSprite).star);
    } else {
      showTooltip.value = false;
      tooltipText.value = null;
    }
  });

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
  height: 100%;
  display: flex;
  background-color: black;
}

canvas {
  flex-grow: 1;
}

:deep(.v-snackbar__content) {
  text-align: center;
  font-weight: bold;
}
</style>
