<script setup lang="ts">
import { computed } from 'vue';
import { currentStar } from '../stars';

const name = computed<string>(
  () =>
    currentStar.value.proper ||
    currentStar.value.bf ||
    currentStar.value.gl ||
    `#${currentStar.value.id}`
);
</script>

<template>
  <h3>
    <strong>{{ name }}</strong> ({{ currentStar.x }}, {{ currentStar.y }}, {{ currentStar.z }})
  </h3>
</template>

<style scoped></style>
