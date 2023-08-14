import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';

import Controls from './Controls';
import {
  BLOOM_INTENSITY_DEFAULT,
  BLOOM_LUMINANCE_SMOOTHING_DEFAULT,
  BLOOM_LUMINANCE_THRESHOLD_DEFAULT,
  BLOOM_RADIUS_DEFAULT,
  CAMERA_FAR_DEFAULT,
  CAMERA_FOV_DEFAULT,
  CAMERA_NEAR_DEFAULT
} from '@renderer/defaults';

export default class Canvas {
  readonly clock = new THREE.Clock();
  readonly canvasSize = new THREE.Vector2(0, 0);
  readonly camera: THREE.PerspectiveCamera;
  readonly stats: Stats;

  controls = null as Controls | null;
  renderer = null as THREE.WebGLRenderer | null;
  composer = null as EffectComposer | null;
  renderPass = null as RenderPass | null;
  bloomEffect = null as BloomEffect | null;

  currentPosition = null as THREE.Vector3 | null;
  positionTween = null as TWEEN.Tween<THREE.Vector3> | null;
  rotationTween = null as TWEEN.Tween<THREE.Euler> | null;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV_DEFAULT,
      1,
      CAMERA_NEAR_DEFAULT,
      CAMERA_FAR_DEFAULT
    );
    this.camera.position.z = 3;
    this.stats = new Stats();
  }

  initialize(canvasElement: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      powerPreference: 'high-performance',
      antialias: false,
      stencil: false,
      depth: false
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;

    this.controls = new Controls(this);

    this.renderPass = new RenderPass(new THREE.Scene(), this.camera);

    this.bloomEffect = new BloomEffect({
      intensity: BLOOM_INTENSITY_DEFAULT,
      radius: BLOOM_RADIUS_DEFAULT,
      luminanceSmoothing: BLOOM_LUMINANCE_SMOOTHING_DEFAULT,
      luminanceThreshold: BLOOM_LUMINANCE_THRESHOLD_DEFAULT
    });

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(new EffectPass(this.camera, this.bloomEffect));
  }

  resize(width: number, height: number): void {
    this.canvasSize.width = width;
    this.canvasSize.height = height;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer?.setSize(width, height);
    this.composer?.setSize(width, height);
  }

  render(time: number): void {
    const delta = this.clock.getDelta();

    this.composer?.render(delta);

    if (this.positionTween) {
      this.positionTween.update(time, false);
    } else if (this.controls) {
      this.controls.update(delta);
    }

    this.stats.update();
  }
}
