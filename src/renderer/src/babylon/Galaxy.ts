import { Engine, KeyboardEventTypes, Sprite, Vector3 } from '@babylonjs/core';
import {
  CAMERA_SPEED_DEFAULT,
  CAMERA_SPEED_WARP,
  MODEL_SIZE,
  RENDER_DISTANCE_3D,
  WATCH_DISTANCE_MULTIPLIER
} from '@renderer/defaults';
import { starPositionsInRange } from '@renderer/state';
import { useThrottleFn } from '@vueuse/core';
import { Star } from 'src/types/Star';
import { StarPosition } from 'src/types/StarPosition';

import GalacticScene from './GalacticScene';
import { realToWorld } from './helper';
import PlanetaryScene from './PlanetaryScene';

export default class Galaxy {
  readonly engine: Engine;
  readonly galacticScene: GalacticScene;
  readonly planetaryScene: PlanetaryScene;
  nearbyStars = [] as StarPosition[];
  lastCameraPosition = Vector3.Zero();

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true);
    this.galacticScene = new GalacticScene(this.engine);
    this.planetaryScene = new PlanetaryScene(this.engine);
  }

  initialize(): void {
    this.galacticScene.initialize();

    this.galacticScene.scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.event.key === 'Shift') {
        if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
          this.galacticScene.camera.speed = CAMERA_SPEED_WARP;
          this.planetaryScene.camera.speed = CAMERA_SPEED_WARP;
        }
        if (kbInfo.type === KeyboardEventTypes.KEYUP) {
          this.galacticScene.camera.speed = CAMERA_SPEED_DEFAULT;
          this.planetaryScene.camera.speed = CAMERA_SPEED_DEFAULT;
        }
      }
    });

    this.engine.runRenderLoop((): void => {
      if (!this.lastCameraPosition.equals(this.galacticScene.camera.position)) {
        this.lastCameraPosition = this.galacticScene.camera.position.clone();

        // Update distance based sprite transparency
        if (this.planetaryScene.spriteManager && this.planetaryScene.spriteManager.sprites.at(0)) {
          console.log(
            (this.planetaryScene.spriteManager.sprites.at(0) as Sprite).position
              .subtract(this.planetaryScene.camera.position)
              .length()
          );
        }

        // Check nearby stars
        this.updateStarObjectsThrotteled();
      }
      this.galacticScene.scene.render();
      this.planetaryScene.scene.render();
    });
  }

  flyTo(target: Star, instantly = false): void {
    console.log(`Flying to star #${target.id}...`);

    const galacticSceneEndFrame = this.galacticScene.camera.setTargetAnimated(
      realToWorld(target.x, target.y, target.z),
      (target.absmag + 20.0) * MODEL_SIZE * WATCH_DISTANCE_MULTIPLIER
    );
    this.galacticScene.scene.beginAnimation(
      this.galacticScene.camera,
      instantly ? galacticSceneEndFrame : 0,
      galacticSceneEndFrame,
      false,
      undefined,
      () => {
        console.log(`Arrived at star #${target.id}...`);
        this.updateStarObjects();
      }
    );
  }

  updateStarObjectsThrotteled = useThrottleFn(this.updateStarObjects, 500);
  updateStarObjects(): void {
    // Find nearby stars
    const start = performance.now();
    const newNearbyStars = starPositionsInRange.value.filter(
      (starPosition) =>
        Math.abs(starPosition.position.subtract(this.galacticScene.camera.position).length()) <=
        RENDER_DISTANCE_3D
    );

    console.log(
      `Searching for ${newNearbyStars.length} nearby stars: ${performance.now() - start} ms`
    );

    if (
      newNearbyStars.length !== this.nearbyStars.length ||
      !newNearbyStars.every((starPosition) => this.nearbyStars.includes(starPosition))
    ) {
      this.nearbyStars = newNearbyStars;

      // Initialize close-up
      if (this.nearbyStars.length > 0) {
        console.log(
          `Initializing close-up of star #${this.nearbyStars[0].star.id}...`,
          this.nearbyStars[0].star
        );

        this.planetaryScene.initialize(this.nearbyStars[0].star);
        this.planetaryScene.camera.position = this.galacticScene.camera.position.subtract(
          this.nearbyStars[0].position
        );
        this.planetaryScene.camera.rotation = this.galacticScene.camera.rotation;
      } else {
        console.log('Disposing star close-up');
        this.planetaryScene.dispose();
      }
    }
  }
}
