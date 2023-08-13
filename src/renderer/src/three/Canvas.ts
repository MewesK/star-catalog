import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
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
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasElement });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;
    this.controls = new Controls(this);
  }

  resize(width: number, height: number): void {
    this.canvasSize.width = width;
    this.canvasSize.height = height;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }

  render(scene: THREE.Scene): void {
    const delta = this.clock.getDelta();

    if (this.renderer && this.controls) {
      this.renderer.render(scene, this.camera);
      this.controls.update(delta);
    }

    this.stats.update();
  }
}
