import { computed, ref } from 'vue';

import Canvas from './three/Canvas';
import PointScene from './three/PointScene';
import { Star } from 'src/types';
import { RENDER_DISTANCE, MAX_RENDER_DISTANCE } from './defaults';

// State

export const stars = ref<Star[]>([]);
export const selectedStarIndex = ref(0);

export const canvas = new Canvas();
export const scene = new PointScene(canvas);

export const menu = ref(true);
export const browser = ref(false);
export const details = ref(false);
export const config = ref(false);

// Getter

export const selectedStar = computed((): Star => stars.value[selectedStarIndex.value]);
export const starsInRange = computed((): Star[] => {
  const start = performance.now();

  let nearbyStars = [] as Star[];
  if (RENDER_DISTANCE >= MAX_RENDER_DISTANCE) {
    nearbyStars = stars.value;
  } else {
    nearbyStars = stars.value.filter(
      (star) => star.x <= RENDER_DISTANCE && star.y <= RENDER_DISTANCE && star.z <= RENDER_DISTANCE
    );
  }
  const end = performance.now();
  console.log(`Searching for nearby stars: ${end - start} ms`);

  return nearbyStars;
});

// Setter

export function selectStar(starIndex: number): void {
  console.log(`Selecting star #${starIndex}...`);
  selectedStarIndex.value = starIndex;
  scene.lookAt(selectedStar.value);
  browser.value = false;
  details.value = true;
}
