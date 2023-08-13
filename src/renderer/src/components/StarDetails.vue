<script setup lang="ts">
import { useElementSize, useParentElement } from '@vueuse/core';

import { currentStar } from '@renderer/state';

const parentEl = useParentElement();
const { height } = useElementSize(parentEl);
</script>

<template>
  <v-table v-if="currentStar" density="compact" hover fixed-header :height="height">
    <thead class="elevation-6 text-caption">
      <tr>
        <th>Property</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody class="text-caption">
      <tr v-for="(value, key) in currentStar" :key="key">
        <td>{{ key }}</td>
        <td>{{ value }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<style scoped></style>
