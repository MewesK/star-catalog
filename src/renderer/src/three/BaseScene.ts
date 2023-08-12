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
    this.animate();
  }

  stop(): void {
    this.running = false;
  }

  abstract animate(): void;
  abstract initialize(): void;
}
