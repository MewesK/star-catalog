<script setup lang="ts">
import { NH3 } from 'naive-ui';
import { computed } from 'vue';
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
  <n-h3 v-if="currentStar">
    <strong>{{ name }}</strong> ({{ currentStar.x }}, {{ currentStar.y }}, {{ currentStar.z }})
  </n-h3>
</template>

<style scoped>
.n-h3 {
  margin: 0;
}
</style>
