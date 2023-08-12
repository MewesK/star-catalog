import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import Controls from './Controls';

export default class Canvas {
  static readonly CAMERA_FOV = 70;
  static readonly CAMERA_NEAR = 1;
  static readonly CAMERA_FAR = 50000;

  readonly canvasSize = new THREE.Vector2(0, 0);
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly stats: Stats;
  readonly controls: Controls;

  constructor(canvasElement: HTMLCanvasElement) {
    this.camera = new THREE.PerspectiveCamera(
      Canvas.CAMERA_FOV,
      1,
      Canvas.CAMERA_NEAR,
      Canvas.CAMERA_FAR
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasElement });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;

    this.stats = new Stats();

    this.controls = new Controls(this, 2, 2 * Canvas.CAMERA_FAR);
  }

  resize(width: number, height: number): void {
    this.canvasSize.width = width;
    this.canvasSize.height = height;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  render(scene: THREE.Scene): void {
    this.renderer.render(scene, this.camera);
    this.controls.update();
    this.stats.update();
  }
}
