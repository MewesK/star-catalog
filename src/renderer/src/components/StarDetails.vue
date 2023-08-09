<script setup lang="ts">
import { computed } from 'vue';
import { format } from '@renderer/helper';
import { currentStar } from '@renderer/stars';

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
  <v-table v-if="currentStar" density="compact" hover>
    <thead>
      <tr>
        <th>Name</th>
        <th>
          {{ name }}
        </th>
      </tr>
      <tr>
        <th>Coord.</th>
        <th>
          ({{ format(currentStar.x) }}, {{ format(currentStar.y) }}, {{ format(currentStar.z) }})
        </th>
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
