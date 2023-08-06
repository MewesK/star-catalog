<script setup lang="ts">
import { computed } from 'vue';
import { currentStar } from '../stars';

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
  <div v-if="currentStar">
    <strong>{{ name }}</strong> ({{ currentStar.x }}, {{ currentStar.y }}, {{ currentStar.z }})
  </div>
</template>

<style scoped></style>
