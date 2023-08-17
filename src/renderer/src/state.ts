import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { computed, ref } from 'vue';

import Canvas from './three/Canvas';
import PointScene from './three/PointScene';
import { Star } from 'src/types/Star';
import { RENDER_DISTANCE, MAX_RENDER_DISTANCE } from './defaults';
import { hygToWorld } from './three/helper';

// State

export const stars = ref<Star[]>([]);
export const selectedStar = ref<Star | null>(null);

export const canvas = new Canvas();
export const scene = new PointScene(canvas);

export const menu = ref(true);
export const browser = ref(false);
export const details = ref(false);
export const config = ref(false);

// Getter

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

export function selectStar(star: Star, noAnimation = false): void {
  if (star.id === selectedStar.value?.id || canvas.flightTween) {
    return;
  }

  console.log(`Selecting star #${star}...`);

  selectedStar.value = star;

  // Compute target location
  const destiantion = hygToWorld(star.x, star.y, star.z);

  // Compute target destination with offset
  const destinationWithOffset = new THREE.Vector3();
  destinationWithOffset
    .subVectors(canvas.camera.position, destiantion)
    .setLength(1.5)
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
