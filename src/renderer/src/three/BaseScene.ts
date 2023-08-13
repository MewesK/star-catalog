import * as THREE from 'three';
import Canvas from './Canvas';

export default abstract class BaseScene {
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
    this.canvas.render();
  }

  abstract animate(): void;
  abstract initialize(): void;
}
