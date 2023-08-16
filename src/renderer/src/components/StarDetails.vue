<script setup lang="ts">
import { useElementSize, useParentElement } from '@vueuse/core';
import { selectedStar } from '@renderer/state';

const { height } = useElementSize(useParentElement());
</script>

<template>
  <v-table v-if="selectedStar !== null" density="compact" hover :height="height" fixed-header>
    <thead class="elevation-6 text-caption">
      <tr>
        <th>Property</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody class="text-caption">
      <tr v-for="(value, key) in selectedStar" :key="key">
        <td>{{ key }}</td>
        <td>{{ value }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<style scoped></style>
