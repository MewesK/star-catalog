import { computed, ref } from 'vue';
import { Star } from '@renderer/../../types';
import { isDev } from '@renderer/helper';

const DISTANCE = 15.0;

export const loading = ref(true);
export const stars = ref<Star[]>([]);
export const currentStarIndex = ref(0);

export const currentStar = computed((): Star | null => stars.value[currentStarIndex.value]);
export const selectedStars = computed((): Star[] => {
  if (isDev) {
    const start = performance.now();

    let nearbyStars = [] as Star[];
    if (currentStar.value) {
      nearbyStars = stars.value.filter(
        (star) =>
          currentStar.value &&
          star.id !== currentStar.value.id &&
          Math.abs(star.x - currentStar.value.x) <= DISTANCE &&
          Math.abs(star.y - currentStar.value.y) <= DISTANCE &&
          Math.abs(star.z - currentStar.value.z) <= DISTANCE
      );
      nearbyStars = [currentStar.value, ...nearbyStars];
    }

    const end = performance.now();
    console.log(`Searching for nearby stars: ${end - start} ms`);

    return nearbyStars;
  }
  return stars.value;
});
