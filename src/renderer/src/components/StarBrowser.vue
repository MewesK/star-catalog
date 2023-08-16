<script setup lang="ts">
import { useElementSize, useParentElement } from '@vueuse/core';

import { format, getStarName } from '@renderer/helper';
import { selectStar, starsInRange } from '@renderer/state';

const parentEl = useParentElement();
const { height } = useElementSize(parentEl);
</script>

<template>
  <v-virtual-scroll :height="height" item-height="48" :items="starsInRange">
    <template #default="{ item, index }">
      <v-list-item
        :title="getStarName(item)"
        :subtitle="`(${format(item.x)}, ${format(item.y)}, ${format(item.z)})`"
        :base-color="item.proper || item.bf || item.gl ? '' : 'grey-darken-1'"
      >
        <template #append>
          <v-btn icon="navigate_next" size="xx-small" variant="tonal" @click="selectStar(index)" />
        </template>
      </v-list-item>
    </template>
  </v-virtual-scroll>
</template>

<style scoped></style>
