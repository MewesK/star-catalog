import { computed, ref } from 'vue';
import { Star } from 'src/types';

const DISTANCE = 100000.0; // Parsec

export const stars = ref<Star[]>([]);

export const currentStarIndex = ref(0);
export const currentStar = computed((): Star => stars.value[currentStarIndex.value]);
export const selectedStars = computed((): Star[] => {
  const start = performance.now();

  let nearbyStars = [] as Star[];
  if (currentStar.value) {
    nearbyStars = stars.value.filter(
      (star) =>
        Math.abs(star.x - currentStar.value.x) <= DISTANCE &&
        Math.abs(star.y - currentStar.value.y) <= DISTANCE &&
        Math.abs(star.z - currentStar.value.z) <= DISTANCE
    );
  }

  const end = performance.now();
  console.log(`Searching for nearby stars: ${end - start} ms`);

  return nearbyStars;
});
