<script setup lang="ts">
import { format } from '@renderer/helper';
import { selectedStars } from '@renderer/stars';
</script>

<template>
  <v-virtual-scroll :items="selectedStars">
    <template #default="{ item }">
      <v-list-item
        :title="item.proper || item.bf || item.gl || `#${item.id}`"
        :subtitle="`(${format(item.x)}, ${format(item.y)}, ${format(item.z)})`"
      >
        <template #append>
          <v-btn icon="navigate_next" size="xx-small" variant="tonal" />
        </template>
      </v-list-item>
    </template>
  </v-virtual-scroll>
</template>

<style scoped></style>
