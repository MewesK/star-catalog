import { computed, ref } from 'vue';
import { Star } from '../../types';

const DISTANCE = 15.0;

export const stars = ref<Star[]>([]);

export const currentStarIndex = ref(0);
export const currentStar = computed((): Star => stars.value[currentStarIndex.value]);
export const nearbyStars = computed((): Star[] => {
  const start = performance.now();

  const nearbyStars = stars.value.filter((star) => {
    return (
      star.id !== currentStar.value.id &&
      Math.abs(star.x - currentStar.value.x) <= DISTANCE &&
      Math.abs(star.y - currentStar.value.y) <= DISTANCE &&
      Math.abs(star.z - currentStar.value.z) <= DISTANCE
    );
  });

  const end = performance.now();
  console.log(`Searching for nearby stars: ${end - start} ms`);

  return nearbyStars;
});
