import {
  BLOOM_INTENSITY,
  BLOOM_LUMINANCE_SMOOTHING,
  BLOOM_LUMINANCE_THRESHOLD,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  PARTICLE_SIZE,
  RENDER_DISTANCE_3D,
  TRAVEL_ROTATION_MULTIPLIER,
  TRAVEL_TIME
} from '@renderer/defaults';
import { scene } from '@renderer/state';
import * as TWEEN from '@tweenjs/tween.js';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect } from 'postprocessing';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import Controls from './Controls';
import { onShaderError } from './helper';

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
      logarithmicDepthBuffer: true,
      precision: 'highp'
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;
    this.renderer.debug.onShaderError = onShaderError;

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
      TWEEN.update(time);
    } else if (this.controls) {
      this.controls.update(delta);
    }

    this.stats.update();
  }

  flyTo(destiantion: THREE.Vector3, instantly = false): void {
    // Compute target destination with offset
    const destinationWithRenderDistanceOffset = new THREE.Vector3();
    destinationWithRenderDistanceOffset
      .subVectors(this.camera.position, destiantion)
      .setLength(RENDER_DISTANCE_3D * 0.5)
      .add(destiantion);

    const destinationWithViewDistanceOffset = new THREE.Vector3();
    destinationWithViewDistanceOffset
      .subVectors(this.camera.position, destiantion)
      .setLength(PARTICLE_SIZE * 3)
      .add(destiantion);

    if (instantly) {
      // Instant teleportation
      this.camera.position.copy(destinationWithViewDistanceOffset);
      this.camera.lookAt(destiantion);
    } else {
      // Compute target rotation
      const rotationMatrix = new THREE.Matrix4();
      rotationMatrix.lookAt(this.camera.position, destiantion, this.camera.up);

      const targetQuaternion = new THREE.Quaternion();
      targetQuaternion.setFromRotationMatrix(rotationMatrix);

      // Start flight tween
      this.flightTween = new TWEEN.Tween(this.camera.position)
        .to(destinationWithRenderDistanceOffset, TRAVEL_TIME * 0.7)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate((_destiantion, elapsed) => {
          if (!this.camera.quaternion.equals(targetQuaternion)) {
            this.camera.quaternion.rotateTowards(
              targetQuaternion,
              elapsed * TRAVEL_ROTATION_MULTIPLIER
            );
          }
        });
      if (destinationWithViewDistanceOffset.distanceTo(destiantion) > RENDER_DISTANCE_3D) {
        this.flightTween
          .to(destinationWithRenderDistanceOffset, TRAVEL_TIME * 0.7)
          .onStart(() => console.log('Long flight starting...'))
          .onComplete(() => {
            scene.updateStarObjects();
          })
          .chain(
            new TWEEN.Tween(this.camera.position)
              .to(destinationWithViewDistanceOffset, TRAVEL_TIME * 0.3)
              .easing(TWEEN.Easing.Linear.None)
              .onComplete(() => {
                console.log('...flight ended.');
                this.flightTween = null;
              })
          )
          .start();
      } else {
        this.flightTween
          .to(destinationWithViewDistanceOffset, TRAVEL_TIME)
          .onStart(() => console.log('Short flight starting...'))
          .onComplete(() => {
            console.log('...flight ended.');
            this.flightTween = null;
          })
          .start();
      }
    }
  }
}
