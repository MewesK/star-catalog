import { AxesViewer, Scene } from '@babylonjs/core';
import { ref, watch } from 'vue';

import { isDev } from './helper';
import { galaxy } from './state';

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
  if (galaxy) {
    galaxy.galacticScene.scene.fogMode = newValue ? Scene.FOGMODE_LINEAR : Scene.FOGMODE_NONE;
  }
});

export const devMode = ref(isDev);
watch(devMode, (newValue) => {
  if (galaxy) {
    if (!newValue) {
      galaxy.galacticScene.axesViewer?.dispose();
    } else {
      galaxy.galacticScene.axesViewer = new AxesViewer(
        galaxy.galacticScene.scene,
        10.0,
        undefined,
        undefined,
        undefined,
        undefined,
        0.2
      );
    }
  }
});
