<script setup lang="ts">
import { computed } from 'vue';
import { useElementSize, useParentElement } from '@vueuse/core';
import { format } from '@renderer/helper';
import { currentStar } from '@renderer/stars';

const parentEl = useParentElement();
const { height } = useElementSize(parentEl);
const name = computed<string>(() =>
  currentStar.value
    ? currentStar.value.proper ||
      currentStar.value.bf ||
      currentStar.value.gl ||
      `#${currentStar.value.id}`
    : ''
);
</script>

<template>
  <v-table v-if="currentStar" density="compact" hover fixed-header :height="height">
    <thead class="elevation-6">
      <tr>
        <th colspan="2" class="text-center">
          <h4>
            {{ name }}<br />
            ({{ format(currentStar.x) }}, {{ format(currentStar.y) }}, {{ format(currentStar.z) }})
          </h4>
        </th>
      </tr>
      <tr class="text-caption">
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
