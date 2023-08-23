import {
  BLOOM_INTENSITY,
  BLOOM_LUMINANCE_SMOOTHING,
  BLOOM_LUMINANCE_THRESHOLD,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  PARTICLE_SIZE,
  TRAVEL_ROTATION_MULTIPLIER,
  TRAVEL_TIME
} from '@renderer/defaults';
import * as TWEEN from '@tweenjs/tween.js';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect } from 'postprocessing';
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
      depth: false,
      logarithmicDepthBuffer: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;

    this.controls = new Controls(this);

    this.renderPass = new RenderPass(new THREE.Scene(), this.camera);

    this.bloomEffect = new BloomEffect({
      intensity: BLOOM_INTENSITY,
      luminanceSmoothing: BLOOM_LUMINANCE_SMOOTHING,
      luminanceThreshold: BLOOM_LUMINANCE_THRESHOLD,
      mipmapBlur: true,
      radius: 0.7
    });

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(new EffectPass(this.camera, this.bloomEffect));
    // The god ray passes will be inserted between these two passes
    this.composer.addPass(new EffectPass(this.camera, new SMAAEffect()));
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

  flyTo(destiantion: THREE.Vector3, instantly = false): void {
    // Compute target destination with offset
    const destinationWithOffset = new THREE.Vector3();
    destinationWithOffset
      .subVectors(this.camera.position, destiantion)
      .setLength(PARTICLE_SIZE * 3)
      .add(destiantion);

    if (instantly) {
      // Instant teleportation
      this.camera.position.copy(destinationWithOffset);
      this.camera.lookAt(destiantion);
    } else {
      // Compute target rotation
      const rotationMatrix = new THREE.Matrix4();
      rotationMatrix.lookAt(this.camera.position, destiantion, this.camera.up);

      const targetQuaternion = new THREE.Quaternion();
      targetQuaternion.setFromRotationMatrix(rotationMatrix);

      // Start flight tween
      this.flightTween = new TWEEN.Tween(this.camera.position)
        .to(destinationWithOffset, TRAVEL_TIME)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onStart(() => console.log('Flight starting...'))
        .onUpdate((_destiantion, elapsed) => {
          if (!this.camera.quaternion.equals(targetQuaternion)) {
            this.camera.quaternion.rotateTowards(
              targetQuaternion,
              elapsed * TRAVEL_ROTATION_MULTIPLIER
            );
          }
        })
        .onComplete(() => {
          console.log('...flight ended.');
          this.flightTween = null;
        })
        .start();
    }
  }
}
