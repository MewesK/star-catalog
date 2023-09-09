import {
  ActionManager,
  AxesViewer,
  Color3,
  Color4,
  DefaultRenderingPipeline,
  Engine,
  ExecuteCodeAction,
  Scene,
  Sprite,
  SpriteManager,
  Vector3
} from '@babylonjs/core';
import {
  CAMERA_FOV,
  CAMERA_MAX_Z,
  CAMERA_SPEED_DEFAULT,
  FOG_END,
  FOG_START,
  PARTICLE_ALPHA,
  SIZE_MULTIPLIER,
  WATCH_DISTANCE
} from '@renderer/defaults';
import { isDev } from '@renderer/helper';
import { selectStar, starsInRange } from '@renderer/state';
import { Star } from 'src/types/Star';

import starTexture from '../assets/particle_light.png';
import { AnimatedFlyCamera } from './AnimatedFlyCamera';
import { bvToColor, hygToWorld } from './helper';

export default class GalaxyScene {
  readonly engine: Engine;
  readonly scene: Scene;
  readonly camera: AnimatedFlyCamera;
  readonly pipeline: DefaultRenderingPipeline;
  spriteManager = null as SpriteManager | null;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true);

    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0, 0, 0, 1);
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogColor = new Color3(0, 0, 0);
    this.scene.fogStart = FOG_START;
    this.scene.fogEnd = FOG_END;

    this.camera = new AnimatedFlyCamera('camera', new Vector3(0, 0, -WATCH_DISTANCE), this.scene);
    this.camera.speed = CAMERA_SPEED_DEFAULT;
    this.camera.fov = CAMERA_FOV;
    this.camera.maxZ = CAMERA_MAX_Z;
    this.camera.angularSensibility = 250.0;
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(true);

    this.pipeline = new DefaultRenderingPipeline('pipeline', true, this.scene, this.scene.cameras);
    this.pipeline.fxaaEnabled = true;
    this.pipeline.samples = 4;

    if (isDev) {
      new AxesViewer(this.scene, 10.0, undefined, undefined, undefined, undefined, 0.2);
    }
  }

  initialize(): void {
    this.engine.stopRenderLoop();

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

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  flyTo(target: Star, instantly = false): void {
    console.log(`Flying to star #${target.id}...`, target);

    const endFrame = this.camera.setTargetAnimated(hygToWorld(target.x, target.y, target.z));
    this.scene.beginAnimation(this.camera, instantly ? endFrame : 0, endFrame, false);
  }
}
