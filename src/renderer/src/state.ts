import { Star } from 'src/types/Star';
import * as THREE from 'three';
import { computed, ref } from 'vue';

import { RENDER_DISTANCE, RENDER_DISTANCE_MAX } from './defaults';
import Canvas from './three/Canvas';
import { hygToWorld } from './three/helper';
import SpaceScene from './three/SpaceScene';

// State

export const stars = ref<Star[]>([]);
export const selectedStar = ref<Star | null>(null);

export const canvas = new Canvas();
export const scene = new SpaceScene(canvas);

export const menu = ref(true);
export const browser = ref(false);
export const details = ref(false);
export const config = ref(false);

// Getter

export const starsInRange = computed((): Star[] => {
  const start = performance.now();

  let nearbyStars = [] as Star[];
  if (RENDER_DISTANCE >= RENDER_DISTANCE_MAX) {
    nearbyStars = stars.value;
  } else {
    const nullVector = new THREE.Vector3();
    nearbyStars = stars.value.filter(
      (star) => hygToWorld(star.x, star.y, star.z).distanceTo(nullVector) <= RENDER_DISTANCE
    );
  }

  console.log(`Searching for stars in range: ${performance.now() - start} ms`);

  return nearbyStars;
});

// Setter

export function selectStar(star: Star, instantly = false): void {
  if (star.id === selectedStar.value?.id || canvas.flightTween) {
    return;
  }

  console.log(`Selecting star #${star.id}...`, star);

  selectedStar.value = star;
  canvas.flyTo(hygToWorld(star.x, star.y, star.z), instantly);
}
