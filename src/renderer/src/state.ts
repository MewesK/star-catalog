import { computed, ref } from 'vue';
import { Star } from 'src/types';
import Canvas from './three/Canvas';
import PointScene from './three/PointScene';

// Constants

const DISTANCE = ref(100000.0); // Parsec

// State

export const canvas = new Canvas();
export const scene = new PointScene(canvas);

export const stars = ref<Star[]>([]);
export const currentStarIndex = ref(0);

// Getter

export const currentStar = computed((): Star => stars.value[currentStarIndex.value]);
export const selectedStars = computed((): Star[] => {
  const start = performance.now();

  let nearbyStars = [] as Star[];
  if (currentStar.value) {
    nearbyStars = stars.value.filter(
      (star) =>
        Math.abs(star.x - currentStar.value.x) <= DISTANCE.value &&
        Math.abs(star.y - currentStar.value.y) <= DISTANCE.value &&
        Math.abs(star.z - currentStar.value.z) <= DISTANCE.value
    );
  }

  const end = performance.now();
  console.log(`Searching for nearby stars: ${end - start} ms`);

  return nearbyStars;
});

// Setter

export function selectStar(starIndex: number): void {
  currentStarIndex.value = starIndex;
  scene.lookAt(currentStar.value);
}
