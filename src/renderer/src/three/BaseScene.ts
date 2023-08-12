import * as THREE from 'three';
import Canvas from './Canvas';

export default abstract class BaseScene {
  pointerEnterCallback = null as
    | ((index: number, intersection: THREE.Intersection<THREE.Object3D>) => void)
    | null;
  pointerLeaveCallback = null as ((index: number) => void) | null;

  readonly canvas: Canvas;
  readonly scene = new THREE.Scene();

  running = false;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.innerAnimate();
  }

  stop(): void {
    this.running = false;
  }

  protected innerAnimate(): void {
    if (this.running) {
      requestAnimationFrame(() => this.innerAnimate());
    }
    this.animate();
    this.canvas.render(this.scene);
  }

  abstract animate(): void;
  abstract initialize(): void;
}
