<script setup lang="ts">
import { computed } from 'vue';
import { versions } from '@renderer/helper';
import { selectedStars, stars } from '@renderer/stars';

const items = computed(() => [
  `Electron v${versions.electron}`,
  `Chromium v${versions.chrome}`,
  `Node v${versions.node}`,
  `${selectedStars.value.length}/${stars.value.length} stars`
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
