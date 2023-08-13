import { computed, ref } from 'vue';
import { Star } from 'src/types';
import Canvas from './three/Canvas';
import PointScene from './three/PointScene';

// Constants

const MAX_DISTANCE = 100000; // Distance that will load all stars (Parsec)
const DISTANCE = ref(1000); // Filter radius for rendered stars (Parsec)

// State

export const stars = ref<Star[]>([]);
export const currentStarIndex = ref(0);

export const canvas = new Canvas();
export const scene = new PointScene(canvas);

export const menu = ref(true);
export const browser = ref(false);
export const details = ref(false);

// Getter

export const currentStar = computed((): Star => stars.value[currentStarIndex.value]);
export const selectedStars = computed((): Star[] => {
  const start = performance.now();

  let nearbyStars = [] as Star[];
  if (DISTANCE.value >= MAX_DISTANCE) {
    nearbyStars = stars.value;
  } else {
    nearbyStars = stars.value.filter(
      (star) => star.x <= DISTANCE.value && star.y <= DISTANCE.value && star.z <= DISTANCE.value
    );
  }
  const end = performance.now();
  console.log(`Searching for nearby stars: ${end - start} ms`);

  return nearbyStars;
});

// Setter

export function selectStar(starIndex: number): void {
  console.log(`Selecting star #${starIndex}...`);
  currentStarIndex.value = starIndex;
  scene.lookAt(currentStar.value);
  details.value = true;
}
