import { Engine, KeyboardEventTypes } from '@babylonjs/core';
import { CAMERA_SPEED_DEFAULT, CAMERA_SPEED_WARP, RENDER_DISTANCE_3D } from '@renderer/defaults';
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
      this.updateStarObjectsThrotteled();
      this.galacticScene.scene.render();
      this.planetaryScene.scene.render();
    });
  }

  flyTo(target: Star, instantly = false): void {
    console.log(`Flying to star #${target.id}...`, target);

    const galacticSceneEndFrame = this.galacticScene.camera.setTargetAnimated(
      realToWorld(target.x, target.y, target.z)
    );
    this.galacticScene.scene.beginAnimation(
      this.galacticScene.camera,
      instantly ? galacticSceneEndFrame : 0,
      galacticSceneEndFrame,
      false
    );
  }

  updateStarObjectsThrotteled = useThrottleFn(this.updateStarObjects, 2500);
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
