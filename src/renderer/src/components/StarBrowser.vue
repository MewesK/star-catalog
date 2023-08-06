<script setup lang="ts">
import { NList, NListItem } from 'naive-ui';
import { selectedStars } from '@renderer/stars';

function format(number: number): string {
  return Number(number).toFixed(2);
}
</script>

<template>
  <n-list hoverable clickable>
    <n-list-item v-for="star in selectedStars" :key="star.id">
      {{ star.proper || star.bf || star.gl || `#${star.id}` }}<br />
      <small>({{ format(star.x) }}, {{ format(star.y) }}, {{ format(star.z) }})</small>
    </n-list-item>
  </n-list>
</template>

<style scoped>
.n-list-item {
  padding: 8px 10px;
}
</style>
