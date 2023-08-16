<script setup lang="ts">
import { bloom, devMode, fog } from '@renderer/config';
</script>

<template>
  <v-container fluid>
    <v-switch
      v-model="bloom"
      label="Bloom"
      messages="Toggle the bloom effect which makes the stars glow."
    ></v-switch>
    <v-switch
      v-model="fog"
      label="Fog"
      messages="Toggle the fog effect which hides distant stars."
    ></v-switch>
    <v-switch v-model="devMode" label="Dev Mode" messages="Toggle the development mode."></v-switch>
  </v-container>
</template>

<style scoped></style>
