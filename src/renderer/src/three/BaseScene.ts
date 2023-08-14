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
