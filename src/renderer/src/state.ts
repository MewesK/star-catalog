import { Star } from 'src/types/Star';
import { computed, ref } from 'vue';

import GalaxyScene from './babylon/GalaxyScene';
import { hygToWorld } from './babylon/helper';
import { RENDER_DISTANCE, RENDER_DISTANCE_MAX } from './defaults';

// State

export const stars = ref<Star[]>([]);
export const selectedStar = ref<Star | null>(null);

export let scene = null as GalaxyScene | null;

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
          (star) => hygToWorld(star.x, star.y, star.z).length() <= RENDER_DISTANCE
        );

  console.log(`Searching for stars in range: ${performance.now() - start} ms`);

  return result;
});

// Setter

export function selectStar(star: Star, instantly = false): void {
  if (star.id === selectedStar.value?.id) {
    return;
  }

  console.log(`Selecting star #${star.id}...`);
  selectedStar.value = star;

  if (scene) {
    scene.flyTo(star, instantly);
  }
}

// Actions

export function createScene(canvas: HTMLCanvasElement): GalaxyScene {
  scene = new GalaxyScene(canvas);
  return scene;
}
