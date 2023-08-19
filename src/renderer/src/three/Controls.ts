import { FlyControls } from 'three/examples/jsm/controls/FlyControls';

import Canvas from './Canvas';

export default class Controls {
  readonly controls: FlyControls;

  constructor(canvas: Canvas) {
    if (!canvas.renderer) {
      throw new Error('Canavs not intialized!');
    }

    this.controls = new FlyControls(canvas.camera, canvas.renderer.domElement);
    this.controls.movementSpeed = 100;
    this.controls.rollSpeed = 0.5;
    this.controls.dragToLook = true;
  }

  update(delta: number): void {
    return this.controls.update(delta);
  }
}
