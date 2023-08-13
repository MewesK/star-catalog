<script setup lang="ts">
import {
  BLOOM_INTENSITY,
  BLOOM_LUMINANCE_SMOOTHING,
  BLOOM_LUMINANCE_THRESHOLD,
  BLOOM_RADIUS,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  CONTROLS_MOVEMENT_SPEED,
  CONTROLS_ROLLSPEED,
  FOG_COLOR,
  FOG_FAR,
  FOG_NEAR,
  MOUSEOVER_COLOR
} from '@renderer/config';
</script>

<template>
  <v-form @submit.prevent>
    <v-text-field v-model="CAMERA_FOV" label="CAMERA_FOV"></v-text-field>
    <v-text-field v-model="CAMERA_NEAR" label="CAMERA_NEAR"></v-text-field>
    <v-text-field v-model="CAMERA_FAR" label="CAMERA_FAR"></v-text-field>
    <v-text-field v-model="CONTROLS_MOVEMENT_SPEED" label="CONTROLS_MOVEMENT_SPEED"></v-text-field>
    <v-text-field v-model="CONTROLS_ROLLSPEED" label="CONTROLS_ROLLSPEED"></v-text-field>
    <v-text-field v-model="BLOOM_INTENSITY" label="BLOOM_INTENSITY"></v-text-field>
    <v-text-field v-model="BLOOM_RADIUS" label="BLOOM_RADIUS"></v-text-field>
    <v-text-field
      v-model="BLOOM_LUMINANCE_SMOOTHING"
      label="BLOOM_LUMINANCE_SMOOTHING"
    ></v-text-field>
    <v-text-field
      v-model="BLOOM_LUMINANCE_THRESHOLD"
      label="BLOOM_LUMINANCE_THRESHOLD"
    ></v-text-field>
    <v-text-field v-model="FOG_COLOR" label="FOG_COLOR"></v-text-field>
    <v-text-field v-model="FOG_NEAR" label="FOG_NEAR"></v-text-field>
    <v-text-field v-model="FOG_FAR" label="FOG_FAR"></v-text-field>
    <v-text-field v-model="MOUSEOVER_COLOR" label="MOUSEOVER_COLOR"></v-text-field>
    <v-btn type="submit" block class="mt-2">Save</v-btn>
  </v-form>
</template>

<style scoped></style>
