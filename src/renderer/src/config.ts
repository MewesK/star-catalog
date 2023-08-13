import * as THREE from 'three';
import { computed } from 'vue';
import { canvas, scene } from './state';
import {
  BLOOM_INTENSITY_DEFAULT,
  BLOOM_LUMINANCE_SMOOTHING_DEFAULT,
  BLOOM_LUMINANCE_THRESHOLD_DEFAULT,
  BLOOM_RADIUS_DEFAULT,
  CONTROLS_MOVEMENT_SPEED_DEFAULT,
  CONTROLS_ROLLSPEED_DEFAULT,
  FOG_COLOR_DEFAULT,
  FOG_FAR_DEFAULT,
  FOG_NEAR_DEFAULT,
  MOUSEOVER_COLOR_DEFAULT
} from './defaults';

// Realtime Properties

export const CAMERA_FOV = computed({
  get() {
    return canvas.camera.fov;
  },
  set(newValue) {
    canvas.camera.fov = newValue;
    canvas.camera.updateProjectionMatrix();
  }
});
export const CAMERA_NEAR = computed({
  get() {
    return canvas.camera.near;
  },
  set(newValue) {
    canvas.camera.near = newValue;
    canvas.camera.updateProjectionMatrix();
  }
});
export const CAMERA_FAR = computed({
  get() {
    return canvas.camera.far;
  },
  set(newValue) {
    canvas.camera.far = newValue;
    canvas.camera.updateProjectionMatrix();
  }
});

export const CONTROLS_MOVEMENT_SPEED = computed({
  get() {
    return canvas.controls
      ? canvas.controls.controls.movementSpeed
      : CONTROLS_MOVEMENT_SPEED_DEFAULT;
  },
  set(newValue) {
    if (canvas.controls) {
      canvas.controls.controls.movementSpeed = newValue;
    }
  }
});
export const CONTROLS_ROLLSPEED = computed({
  get() {
    return canvas.controls ? canvas.controls.controls.rollSpeed : CONTROLS_ROLLSPEED_DEFAULT;
  },
  set(newValue) {
    if (canvas.controls) {
      canvas.controls.controls.rollSpeed = newValue;
    }
  }
});

export const BLOOM_INTENSITY = computed({
  get() {
    return canvas.bloomEffect ? canvas.bloomEffect.intensity : BLOOM_INTENSITY_DEFAULT;
  },
  set(newValue) {
    if (canvas.bloomEffect) {
      canvas.bloomEffect.intensity = newValue;
    }
  }
});
export const BLOOM_RADIUS = computed({
  get() {
    // @ts-ignore (define in dts)
    return canvas.bloomEffect && canvas.bloomEffect.mipmapBlurPass
      ? // @ts-ignore (define in dts)
        canvas.bloomEffect.mipmapBlurPass.radius
      : BLOOM_RADIUS_DEFAULT;
  },
  set(newValue) {
    // @ts-ignore (define in dts)
    if (canvas.bloomEffect && canvas.bloomEffect.mipmapBlurPass) {
      // @ts-ignore (define in dts)
      canvas.bloomEffect.mipmapBlurPass.radius = newValue;
    }
  }
});
export const BLOOM_LUMINANCE_SMOOTHING = computed({
  get() {
    return canvas.bloomEffect
      ? canvas.bloomEffect.luminanceMaterial.smoothing
      : BLOOM_LUMINANCE_SMOOTHING_DEFAULT;
  },
  set(newValue) {
    if (canvas.bloomEffect) {
      canvas.bloomEffect.luminanceMaterial.smoothing = newValue;
    }
  }
});
export const BLOOM_LUMINANCE_THRESHOLD = computed({
  get() {
    return canvas.bloomEffect
      ? canvas.bloomEffect.luminanceMaterial.threshold
      : BLOOM_LUMINANCE_THRESHOLD_DEFAULT;
  },
  set(newValue) {
    if (canvas.bloomEffect) {
      canvas.bloomEffect.luminanceMaterial.threshold = newValue;
    }
  }
});

export const FOG_COLOR = computed({
  get() {
    return scene.scene.fog ? scene.scene.fog.color : FOG_COLOR_DEFAULT;
  },
  set(newValue) {
    if (scene.scene.fog) {
      scene.scene.fog.color.set(newValue);
    }
  }
});
export const FOG_NEAR = computed({
  get() {
    return scene.scene.fog ? (scene.scene.fog as THREE.Fog).near : FOG_NEAR_DEFAULT;
  },
  set(newValue) {
    if (scene.scene.fog) {
      (scene.scene.fog as THREE.Fog).near = newValue;
    }
  }
});
export const FOG_FAR = computed({
  get() {
    return scene.scene.fog ? (scene.scene.fog as THREE.Fog).far : FOG_FAR_DEFAULT;
  },
  set(newValue) {
    if (scene.scene.fog) {
      (scene.scene.fog as THREE.Fog).far = newValue;
    }
  }
});

export let MOUSEOVER_COLOR_CUSTOM = MOUSEOVER_COLOR_DEFAULT;
export const MOUSEOVER_COLOR = computed({
  get() {
    return MOUSEOVER_COLOR_CUSTOM;
  },
  set(newValue) {
    MOUSEOVER_COLOR_CUSTOM = newValue;
  }
});
