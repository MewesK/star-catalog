<script setup lang="ts">
import { ref } from 'vue';
import { useElementSize, useParentElement } from '@vueuse/core';
import { selectedStar } from '@renderer/state';

const card = ref(null);
const { height: cardHeight } = useElementSize(card);
const { height: parentHeight } = useElementSize(useParentElement());
</script>

<template>
  <v-card :height="parentHeight" class="d-flex flex-column">
    <v-card-title>Details</v-card-title>

    <v-divider></v-divider>

    <v-card-text ref="card" class="flex-grow-1 pa-0">
      <v-table
        v-if="selectedStar !== null"
        density="compact"
        hover
        :height="cardHeight"
        fixed-header
      >
        <thead class="elevation-6 text-caption">
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody class="text-caption">
          <tr v-for="(value, key) in selectedStar" :key="key">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<style scoped></style>
