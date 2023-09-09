import { CAMERA_SPEED_DEFAULT, CONTROLS_ROLLSPEED } from '@renderer/defaults';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';

import Canvas from './Canvas';

export default class Controls {
  readonly controls: FlyControls;

  constructor(canvas: Canvas) {
    if (!canvas.renderer) {
      throw new Error('Canavs not intialized!');
    }

    this.controls = new FlyControls(canvas.camera, canvas.renderer.domElement);
    this.controls.movementSpeed = CAMERA_SPEED_DEFAULT;
    this.controls.rollSpeed = CONTROLS_ROLLSPEED;
    this.controls.dragToLook = true;
  }

  update(delta: number): void {
    return this.controls.update(delta);
  }
}
