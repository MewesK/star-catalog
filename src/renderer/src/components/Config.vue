<script setup lang="ts">
import { bloom, devMode, fog } from '@renderer/config';
</script>

<template>
  <v-container fluid>
    <v-switch v-model="bloom" label="Bloom">
      <template #details>Toggle the bloom effect which makes the stars glow.</template>
    </v-switch>
    <v-switch v-model="fog" label="Fog">
      <template #details>Toggle the fog effect which hides distant stars.</template>
    </v-switch>
    <v-switch v-model="devMode" label="Dev Mode">
      <template #details>Toggle the development mode.</template>
    </v-switch>
  </v-container>
</template>

<style scoped></style>
