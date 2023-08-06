<script setup lang="ts">
import { nearbyStars } from '../stars';
import StarBrowserItem from './StarBrowserItem.vue';
</script>

<template>
  <strong>Nearby stars: {{ nearbyStars.length }}</strong>
  <ul>
    <li v-for="star in nearbyStars" :key="star.id">
      <StarBrowserItem :star="star"></StarBrowserItem>
    </li>
  </ul>
</template>

<style scoped></style>
