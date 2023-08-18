<script setup lang="ts">
import { computed, ref } from 'vue';
import { useElementSize, useParentElement } from '@vueuse/core';

import { format, getStarName } from '@renderer/helper';
import { selectStar, selectedStar, starsInRange } from '@renderer/state';
import { Star } from 'src/types/Star';

const query = ref('');
const card = ref(null);
const { height: cardHeight } = useElementSize(card);
const { height: parentHeight } = useElementSize(useParentElement());
const starsInRangeFiltered = computed((): Star[] => {
  if (query.value === '') {
    return [...starsInRange.value.values()];
  }
  const result = [] as Star[];
  starsInRange.value.forEach((value) => {
    if (getStarName(value).toLowerCase().includes(query.value.toLowerCase())) {
      result.push(value);
    }
  });
  return result;
});
</script>

<template>
  <v-card :height="parentHeight" class="d-flex flex-column">
    <v-card-title>Browser</v-card-title>

    <v-divider></v-divider>

    <v-text-field
      v-model="query"
      density="compact"
      variant="solo"
      label="Search stars"
      append-inner-icon="search"
      single-line
      hide-details
    ></v-text-field>

    <v-card-text ref="card" class="flex-grow-1 pa-0">
      <v-virtual-scroll :height="cardHeight" item-height="48" :items="starsInRangeFiltered">
        <template #default="{ item }">
          <v-list-item
            :title="getStarName(item)"
            :subtitle="`(${format(item.x)}, ${format(item.y)}, ${format(item.z)})`"
            :base-color="item.proper || item.bf || item.gl ? '' : 'grey-darken-1'"
            :active="selectedStar?.id === item.id"
          >
            <template #append>
              <v-btn
                icon="navigate_next"
                size="xx-small"
                variant="tonal"
                @click="selectStar(item)"
              />
            </template>
          </v-list-item>
        </template>
      </v-virtual-scroll>
    </v-card-text>
  </v-card>
</template>

<style scoped></style>
