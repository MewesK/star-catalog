<script setup lang="ts">
import { computed } from 'vue';
import { Star } from '../../../types';

function format(number: number): string {
  return Number(number).toFixed(2);
}

const props = defineProps<{ star: Star }>();
const name = computed<string>(
  () => props.star.proper || props.star.bf || props.star.gl || `#${props.star.id}`
);
</script>

<template>
  <span>
    <a href="#">{{ name }}</a>
    <small>({{ format(star.x) }}, {{ format(star.y) }}, {{ format(star.z) }})</small>
  </span>
</template>

<style scoped></style>
