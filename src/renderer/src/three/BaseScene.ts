import * as THREE from 'three';

import Canvas from './Canvas';

export default abstract class BaseScene extends EventTarget {
  readonly canvas: Canvas;
  readonly scene = new THREE.Scene();
  readonly clock = new THREE.Clock();

  running = false;

  constructor(canvas: Canvas) {
    super();
    this.canvas = canvas;
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.innerAnimate(0);
  }

  stop(): void {
    this.running = false;
  }

  protected innerAnimate(time: number): void {
    if (this.running) {
      requestAnimationFrame((time) => this.innerAnimate(time));
    }
    this.animate(time);
    this.canvas.render(time);
  }

  abstract animate(time: number): void;
  abstract initialize(): void;
}
