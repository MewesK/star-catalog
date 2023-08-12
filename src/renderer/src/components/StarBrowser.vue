<script setup lang="ts">
import { useElementSize, useParentElement } from '@vueuse/core';
import { format } from '@renderer/helper';
import { getStarName, selectedStars } from '@renderer/stars';

const parentEl = useParentElement();
const { height } = useElementSize(parentEl);
</script>

<template>
  <v-virtual-scroll :height="height" item-height="48" :items="selectedStars">
    <template #default="{ item }">
      <v-list-item
        :title="getStarName(item)"
        :subtitle="`(${format(item.x)}, ${format(item.y)}, ${format(item.z)})`"
        :base-color="item.proper || item.bf || item.gl ? '' : 'grey-darken-1'"
      >
        <template #append>
          <v-btn icon="navigate_next" size="xx-small" variant="tonal" />
        </template>
      </v-list-item>
    </template>
  </v-virtual-scroll>
</template>

<style scoped></style>
