import { Engine, ParticleHelper, Scene, Vector3 } from '@babylonjs/core';
import {
  CAMERA_FOV,
  CAMERA_MAX_Z,
  CAMERA_SENSIBILITY,
  CAMERA_SPEED_DEFAULT,
  WATCH_DISTANCE
} from '@renderer/defaults';

import { AnimatedFlyCamera } from './AnimatedFlyCamera';

export default class PlanetaryScene {
  readonly scene: Scene;
  readonly camera: AnimatedFlyCamera;

  constructor(engine: Engine) {
    this.scene = new Scene(engine);
    this.scene.autoClear = false;

    this.camera = new AnimatedFlyCamera('camera', new Vector3(0, 0, -WATCH_DISTANCE), this.scene);
    this.camera.speed = CAMERA_SPEED_DEFAULT;
    this.camera.fov = CAMERA_FOV;
    this.camera.maxZ = CAMERA_MAX_Z;
    this.camera.angularSensibility = CAMERA_SENSIBILITY;
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(true);
  }

  initialize(): void {
    // https://assets.babylonjs.com/particles/systems/sun.json
    ParticleHelper.CreateAsync('sun', this.scene).then((set) => {
      set.start();
    });
  }
}
