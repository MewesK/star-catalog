<script setup lang="ts">
import { ref } from 'vue';
import { useElementSize, useParentElement } from '@vueuse/core';

import { format, getStarName } from '@renderer/helper';
import { selectStar, selectedStarIndex, starsInRange } from '@renderer/state';

const card = ref(null);
const { height: cardHeight } = useElementSize(card);
const { height: parentHeight } = useElementSize(useParentElement());
</script>

<template>
  <v-card :height="parentHeight" class="d-flex flex-column">
    <v-card-title>Browser</v-card-title>

    <v-divider></v-divider>

    <v-card-text ref="card" class="flex-grow-1 pa-0">
      <v-virtual-scroll :height="cardHeight" item-height="48" :items="starsInRange">
        <template #default="{ item, index }">
          <v-list-item
            :title="getStarName(item)"
            :subtitle="`(${format(item.x)}, ${format(item.y)}, ${format(item.z)})`"
            :base-color="item.proper || item.bf || item.gl ? '' : 'grey-darken-1'"
            :active="selectedStarIndex === index"
          >
            <template #append>
              <v-btn
                icon="navigate_next"
                size="xx-small"
                variant="tonal"
                @click="selectStar(index)"
              />
            </template>
          </v-list-item>
        </template>
      </v-virtual-scroll>
    </v-card-text>
  </v-card>
</template>

<style scoped></style>
