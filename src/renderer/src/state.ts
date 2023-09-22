import { Star } from 'src/types/Star';
import { StarPosition } from 'src/types/StarPosition';
import { computed, ref, shallowRef } from 'vue';

import Galaxy from './babylon/Galaxy';
import { realToWorld } from './babylon/helper';
import { CAMERA_SPEED_DEFAULT, RENDER_DISTANCE, RENDER_DISTANCE_MAX } from './defaults';

// State

export const stars = ref<Star[]>([]);
export const selectedStar = ref<Star | null>(null);
export const galaxy = shallowRef<Galaxy | null>(null);
export const speedBase = ref(1.0);
export const speedMultiplier = ref(CAMERA_SPEED_DEFAULT);

export const menu = ref(true);
export const browser = ref(false);
export const details = ref(false);
export const config = ref(false);

// Getter

export const starsInRange = computed((): Star[] => {
  const start = performance.now();
  const result =
    RENDER_DISTANCE >= RENDER_DISTANCE_MAX
      ? stars.value
      : stars.value.filter(
          (star) => realToWorld(star.x, star.y, star.z).length() <= RENDER_DISTANCE
        );

  console.log(`Searching for stars in range: ${performance.now() - start} ms`);

  return result;
});

export const starPositionsInRange = computed((): StarPosition[] =>
  starsInRange.value.map(
    (star, index) =>
      ({ index, star, position: realToWorld(star.x, star.y, star.z) }) as StarPosition
  )
);

// Setter

export function selectStar(star: Star, instantly = false): void {
  if (star.id === selectedStar.value?.id) {
    return;
  }

  console.log(`Selecting star #${star.id}...`);
  selectedStar.value = star;

  if (galaxy.value) {
    galaxy.value.flyTo(star, instantly);
  }
}

// Actions

export function createGalaxy(canvas: HTMLCanvasElement): Galaxy {
  galaxy.value = new Galaxy(canvas);
  return galaxy.value;
}
