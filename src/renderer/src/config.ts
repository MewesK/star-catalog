import * as THREE from 'three';

import { ref, watch } from 'vue';
import { canvas, scene } from './state';
import { BLOOM_INTENSITY_DEFAULT, FOG_NEAR_DEFAULT } from './defaults';
import { isDev } from './helper';

// Realtime Properties

export const bloom = ref(true);
watch(bloom, (newValue) => {
  if (canvas.bloomEffect) canvas.bloomEffect.intensity = newValue ? BLOOM_INTENSITY_DEFAULT : 0;
});

export const fog = ref(true);
watch(fog, (newValue) => {
  (scene.scene.fog as THREE.Fog).near = newValue ? FOG_NEAR_DEFAULT : Infinity;
});

export const devMode = ref(isDev);
watch(devMode, (newValue) => {
  canvas.stats.dom.hidden = !newValue;
});
