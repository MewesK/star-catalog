import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import Controls from './Controls';

export default class Canvas {
  static readonly CAMERA_FOV = 70;
  static readonly CAMERA_NEAR = 1;
  static readonly CAMERA_FAR = 50000;

  readonly clock = new THREE.Clock();
  readonly canvasSize = new THREE.Vector2(0, 0);
  readonly camera: THREE.PerspectiveCamera;
  readonly stats: Stats;

  controls = null as Controls | null;
  renderer = null as THREE.WebGLRenderer | null;
  composer = null as EffectComposer | null;
  renderPass = null as RenderPass | null;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      Canvas.CAMERA_FOV,
      1,
      Canvas.CAMERA_NEAR,
      Canvas.CAMERA_FAR
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
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(
      new EffectPass(
        this.camera,
        new BloomEffect({ intensity: 1.0, radius: 1, luminanceSmoothing: 0.2 })
      )
    );
  }

  resize(width: number, height: number): void {
    this.canvasSize.width = width;
    this.canvasSize.height = height;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer?.setSize(width, height);
    this.composer?.setSize(width, height);
  }

  render(): void {
    const delta = this.clock.getDelta();

    this.composer?.render(delta);
    this.controls?.update(delta);

    this.stats.update();
  }
}
