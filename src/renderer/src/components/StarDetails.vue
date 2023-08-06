<script setup lang="ts">
import { NH3, NText, NIcon } from 'naive-ui';
import { computed } from 'vue';
import { Star48Filled } from '@vicons/fluent';
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
  <n-icon size="40" style="padding-right: 14px">
    <Star48Filled />
  </n-icon>
  <div v-if="currentStar">
    <n-h3>
      {{ name }}
    </n-h3>
    <n-text depth="3" tag="div">
      ({{ currentStar.x }}, {{ currentStar.y }}, {{ currentStar.z }})
    </n-text>
  </div>
</template>

<style scoped>
.n-h3,
.n-text {
  line-height: normal;
  margin: 0;
}
</style>
