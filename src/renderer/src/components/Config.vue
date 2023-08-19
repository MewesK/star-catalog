<script setup lang="ts">
import { bloom, devMode, fog } from '@renderer/config';
import { useElementSize, useParentElement } from '@vueuse/core';
import { computed } from 'vue';

const { height: parentHeight } = useElementSize(useParentElement());

const selected = computed({
  get() {
    return [
      bloom.value ? 'bloom' : null,
      fog.value ? 'fog' : null,
      devMode.value ? 'devMode' : null
    ];
  },
  set(value) {
    bloom.value = value.includes('bloom');
    fog.value = value.includes('fog');
    devMode.value = value.includes('devMode');
  }
});
</script>

<template>
  <v-card :height="parentHeight">
    <v-card-title>Config</v-card-title>

    <v-divider></v-divider>

    <v-list v-model:selected="selected" lines="three" select-strategy="classic">
      <v-list-item value="bloom">
        <template #prepend="{ isActive }">
          <v-list-item-action start>
            <v-checkbox-btn :model-value="isActive"></v-checkbox-btn>
          </v-list-item-action>
        </template>

        <v-list-item-title>Bloom</v-list-item-title>

        <v-list-item-subtitle>
          Toggle the bloom effect which makes the stars glow
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item value="fog">
        <template #prepend="{ isActive }">
          <v-list-item-action start>
            <v-checkbox-btn :model-value="isActive"></v-checkbox-btn>
          </v-list-item-action>
        </template>

        <v-list-item-title>Fog</v-list-item-title>

        <v-list-item-subtitle>
          Toggle the fog effect which hides distant stars
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item value="devMode">
        <template #prepend="{ isActive }">
          <v-list-item-action start>
            <v-checkbox-btn :model-value="isActive"></v-checkbox-btn>
          </v-list-item-action>
        </template>

        <v-list-item-title>Dev Mode</v-list-item-title>

        <v-list-item-subtitle> Toggle the development mode </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<style scoped></style>
