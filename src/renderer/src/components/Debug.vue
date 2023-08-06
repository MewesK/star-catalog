<script setup lang="ts">
import { NIcon } from 'naive-ui';
import { BoxDismiss20Regular, BoxCheckmark20Regular, Star12Filled } from '@vicons/fluent';

import { isDev, versions } from '@renderer/helper';
import { selectedStars, stars } from '@renderer/stars';
</script>

<template>
  <ul>
    <li>Electron v{{ versions.electron }}</li>
    <li>Chromium v{{ versions.chrome }}</li>
    <li>Node v{{ versions.node }}</li>
    <li>V8 v{{ versions.v8 }}</li>
    <li>
      {{ stars.length }}
      <n-icon size="10">
        <Star12Filled />
      </n-icon>
      loaded
    </li>
    <li>
      {{ selectedStars.length }}
      <n-icon size="10">
        <Star12Filled />
      </n-icon>
      selected
    </li>
    <li>
      <n-icon v-if="isDev" size="20" title="Development mode">
        <BoxDismiss20Regular />
      </n-icon>
      <n-icon v-else size="20" title="Production mode">
        <BoxCheckmark20Regular />
      </n-icon>
    </li>
  </ul>
</template>

<style scoped>
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

li {
  display: inline-block;
  opacity: 0.8;
  padding: 0 0.5rem;
  vertical-align: top;
}

li:not(:last-child) {
  border-right: 1px solid black;
}
</style>
