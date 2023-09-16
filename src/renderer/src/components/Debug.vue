<script setup lang="ts">
import { versions } from '@renderer/helper';
import { galaxy, stars, starsInRange } from '@renderer/state';
import { computed } from 'vue';

const glInfo = computed(() => galaxy.value?.engine.getGlInfo());
const items = computed(() => [
  `Electron v${versions.electron}`,
  `Chromium v${versions.chrome}`,
  `Node v${versions.node}`,
  glInfo.value ? glInfo.value.version : 'no WebGL',
  `${starsInRange.value.length}/${stars.value.length} stars`
]);
</script>

<template>
  <div class="d-flex justify-space-between text-caption" style="opacity: 0.5; width: 100%">
    <v-sheet v-for="item in items" :key="item" class="text-center">
      {{ item }}
    </v-sheet>
  </div>
</template>

<style scoped></style>
