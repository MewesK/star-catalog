<script setup lang="ts">
import { computed } from 'vue';
import WebGL from 'three/examples/jsm/capabilities/WebGL.js';

import { versions } from '@renderer/helper';
import { starsInRange, stars } from '@renderer/state';

const items = computed(() => [
  `Electron v${versions.electron}`,
  `Chromium v${versions.chrome}`,
  `Node v${versions.node}`,
  WebGL.isWebGL2Available() ? 'WebGL v2' : WebGL.isWebGLAvailable() ? 'WebGL v1' : 'no WebGL',
  `${starsInRange.value.length}/${stars.value.length} stars`
]);
</script>

<template>
  <v-row justify="center" class="text-caption" no-gutters style="opacity: 0.5">
    <v-col v-for="item in items" :key="item" class="text-center">
      {{ item }}
    </v-col>
  </v-row>
</template>

<style scoped></style>
