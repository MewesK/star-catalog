import * as TWEEN from '@tweenjs/tween.js';
import { Star } from 'src/types/Star';
import * as THREE from 'three';
import { computed, ref } from 'vue';

import { PARTICLE_SIZE, RENDER_DISTANCE, RENDER_DISTANCE_MAX } from './defaults';
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

export function selectStar(star: Star, noAnimation = false): void {
  if (star.id === selectedStar.value?.id || canvas.flightTween) {
    return;
  }

  console.log(`Selecting star #${star.id}...`, star);

  selectedStar.value = star;

  // Compute target location
  const destiantion = hygToWorld(star.x, star.y, star.z);

  // Compute target destination with offset
  const destinationWithOffset = new THREE.Vector3();
  destinationWithOffset
    .subVectors(canvas.camera.position, destiantion)
    .setLength(PARTICLE_SIZE * 3)
    .add(destiantion);

  if (noAnimation) {
    canvas.camera.position.copy(destinationWithOffset);
    canvas.camera.lookAt(destiantion);
  } else {
    // Compute target rotation
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.lookAt(canvas.camera.position, destiantion, canvas.camera.up);

    const targetQuaternion = new THREE.Quaternion();
    targetQuaternion.setFromRotationMatrix(rotationMatrix);

    // Start flight tween
    canvas.flightTween = new TWEEN.Tween(canvas.camera.position)
      .to(destinationWithOffset, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onStart(() => console.log('Flight starting...'))
      .onUpdate((_destiantion, elapsed) => {
        if (!canvas.camera.quaternion.equals(targetQuaternion)) {
          canvas.camera.quaternion.rotateTowards(targetQuaternion, elapsed / 10);
        }
      })
      .onComplete(() => {
        console.log('...flight ended.');
        canvas.flightTween = null;
      })
      .start();
  }
}
