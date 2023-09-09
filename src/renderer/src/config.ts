import { Scene } from '@babylonjs/core';
import * as THREE from 'three';
import { ref, watch } from 'vue';

import { BLOOM_INTENSITY, FOG_START } from './defaults';
import { isDev } from './helper';
import { scene } from './state';

// Realtime Properties

export const bloom = ref(true);
watch(bloom, (newValue) => {
  //if (canvas.bloomEffect) canvas.bloomEffect.intensity = newValue ? BLOOM_INTENSITY : 0;
});

export const rays = ref(true);
watch(rays, (newValue) => {
  /*if (canvas.composer)
    scene.nearbyStars.forEach((value) => {
      value.effects.forEach((effect) => {
        effect.enabled = newValue;
      });
    });*/
});

export const fog = ref(true);
watch(fog, (newValue) => {
  if (scene) {
    scene.scene.fogMode = newValue ? Scene.FOGMODE_LINEAR : Scene.FOGMODE_NONE;
  }
});

export const devMode = ref(isDev);
watch(devMode, (newValue) => {
  //canvas.stats.dom.hidden = !newValue;
});
