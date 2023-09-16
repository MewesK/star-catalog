import {
  ActionManager,
  Color3,
  Color4,
  Engine,
  ExecuteCodeAction,
  FxaaPostProcess,
  GroundMesh,
  MeshBuilder,
  PhotoDome,
  Scene,
  SpriteManager,
  Vector3
} from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import {
  CAMERA_FOV,
  CAMERA_MAX_Z,
  CAMERA_SENSIBILITY,
  CAMERA_SPEED_DEFAULT,
  FOG_END,
  FOG_START,
  PARTICLE_ALPHA,
  PARTICLE_SIZE,
  RENDER_DISTANCE_3D,
  WATCH_DISTANCE
} from '@renderer/defaults';
import { isDev } from '@renderer/helper';
import { selectStar, starsInRange } from '@renderer/state';

import milkywayTexture from '../assets/milkyway_gaia_4000x2000.png';
import starTexture from '../assets/particle_light.png';
import { AnimatedFlyCamera } from './AnimatedFlyCamera';
import { bvToColor, realToWorld } from './helper';
import { StarSprite } from './StarSprite';

export default class GalacticScene {
  readonly scene: Scene;
  readonly camera: AnimatedFlyCamera;
  readonly dome: PhotoDome;
  readonly fxaaPostProcess: FxaaPostProcess;
  spriteManager = null as SpriteManager | null;
  ground = null as GroundMesh | null;

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
    this.camera.minZ = RENDER_DISTANCE_3D;
    this.camera.maxZ = CAMERA_MAX_Z;
    this.camera.angularSensibility = CAMERA_SENSIBILITY;
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(true);

    this.dome = new PhotoDome('galacticDome', milkywayTexture, {}, this.scene);
    this.dome.infiniteDistance = true;
    this.dome.mesh.isPickable = false;

    this.fxaaPostProcess = new FxaaPostProcess('fxaaPostProcess', 4.0, this.camera);

    if (isDev) {
      const groundMaterial = new GridMaterial('groundMaterial', this.scene);
      groundMaterial.majorUnitFrequency = 5;
      groundMaterial.minorUnitVisibility = 0.5;
      groundMaterial.gridRatio = 2;
      groundMaterial.opacity = 0.99;

      this.ground = MeshBuilder.CreateGround(
        'ground',
        { width: 100, height: 100, updatable: false },
        this.scene
      );
      this.ground.material = groundMaterial;
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
      starSprite = new StarSprite('starSprite', star, this.spriteManager);
      starSprite.position = realToWorld(star.x, star.y, star.z);
      starSprite.color = bvToColor(star.ci, PARTICLE_ALPHA);
      starSprite.size = (star.absmag / 10.0 + 2.0) * PARTICLE_SIZE;
      starSprite.isPickable = true;
      starSprite.actionManager = new ActionManager(this.scene);
      starSprite.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickUpTrigger, (): void => selectStar(star, false))
      );
    }
  }
}
