<script setup lang="ts">
import { ref } from 'vue';
import { versions } from '@renderer/helper';
import { selectedStars, stars } from '@renderer/stars';

const items = ref([
  `Electron v${versions.electron}`,
  `Chromium v${versions.chrome}`,
  `Node v${versions.node}`,
  `${stars.value.length} stars loaded`,
  `${selectedStars.value.length} stars selected`
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
