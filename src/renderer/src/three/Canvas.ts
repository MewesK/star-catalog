import {
  BLOOM_INTENSITY,
  BLOOM_LUMINANCE_SMOOTHING,
  BLOOM_LUMINANCE_THRESHOLD,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR
} from '@renderer/defaults';
import * as TWEEN from '@tweenjs/tween.js';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import Controls from './Controls';

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
  flightTween = null as TWEEN.Tween<THREE.Vector3> | null;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR);
    this.camera.position.z = -1;
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
      intensity: BLOOM_INTENSITY,
      luminanceSmoothing: BLOOM_LUMINANCE_SMOOTHING,
      luminanceThreshold: BLOOM_LUMINANCE_THRESHOLD
    });

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass);
    //this.composer.addPass(new EffectPass(this.camera, new DepthOfFieldEffect(this.camera)));
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

    if (this.flightTween) {
      this.flightTween.update(time);
    } else if (this.controls) {
      this.controls.update(delta);
    }

    this.stats.update();
  }
}
