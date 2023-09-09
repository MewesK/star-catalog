import {
  ActionManager,
  AxesViewer,
  Color3,
  Color4,
  Engine,
  ExecuteCodeAction,
  FxaaPostProcess,
  PhotoDome,
  Scene,
  Sprite,
  SpriteManager,
  Vector3
} from '@babylonjs/core';
import {
  CAMERA_FOV,
  CAMERA_MAX_Z,
  CAMERA_SENSIBILITY,
  CAMERA_SPEED_DEFAULT,
  FOG_END,
  FOG_START,
  PARTICLE_ALPHA,
  SIZE_MULTIPLIER,
  WATCH_DISTANCE
} from '@renderer/defaults';
import { isDev } from '@renderer/helper';
import { selectStar, starsInRange } from '@renderer/state';

import milkywayTexture from '../assets/milkyway_gaia_4000x2000.png';
import starTexture from '../assets/particle_light.png';
import { AnimatedFlyCamera } from './AnimatedFlyCamera';
import { bvToColor, hygToWorld } from './helper';

export default class GalacticScene {
  readonly scene: Scene;
  readonly camera: AnimatedFlyCamera;
  readonly fxaaPostProcess: FxaaPostProcess;
  spriteManager = null as SpriteManager | null;
  axesViewer = null as AxesViewer | null;

  constructor(engine: Engine) {
    this.scene = new Scene(engine);
    this.scene.clearColor = new Color4(0, 0, 0, 1).toLinearSpace();
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogColor = new Color3(0, 0, 0);
    this.scene.fogStart = FOG_START;
    this.scene.fogEnd = FOG_END;

    this.camera = new AnimatedFlyCamera('camera', new Vector3(0, 0, -WATCH_DISTANCE), this.scene);
    this.camera.speed = CAMERA_SPEED_DEFAULT;
    this.camera.fov = CAMERA_FOV;
    this.camera.maxZ = CAMERA_MAX_Z;
    this.camera.angularSensibility = CAMERA_SENSIBILITY;
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(true);

    const dome = new PhotoDome('galacticDome', milkywayTexture, {}, this.scene);
    dome.infiniteDistance = true;
    dome.mesh.isPickable = false;

    this.fxaaPostProcess = new FxaaPostProcess('fxaaPostProcess', 4.0, this.camera);

    if (isDev) {
      this.axesViewer = new AxesViewer(
        this.scene,
        10.0,
        undefined,
        undefined,
        undefined,
        undefined,
        0.2
      );
    }
  }

  initialize(): void {
    if (this.spriteManager) {
      this.spriteManager.dispose();
    }

    this.spriteManager = new SpriteManager(
      'starManager',
      starTexture,
      starsInRange.value.length,
      256,
      this.scene
    );
    this.spriteManager.isPickable = true;

    let starSprite;
    for (let i = 0; i < starsInRange.value.length; i++) {
      const star = starsInRange.value[i];
      starSprite = new Sprite('star', this.spriteManager);
      starSprite.position = hygToWorld(star.x, star.y, star.z);
      starSprite.color = bvToColor(star.ci, PARTICLE_ALPHA);
      starSprite.size = Math.log(star.lum) * SIZE_MULTIPLIER;
      starSprite.isPickable = true;
      starSprite.actionManager = new ActionManager(this.scene);
      starSprite.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickUpTrigger, (): void => selectStar(star, false))
      );
    }
  }
}
