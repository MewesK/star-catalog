import { Engine, KeyboardEventTypes, Sprite, Vector3 } from '@babylonjs/core';
import {
  CAMERA_SPEED_DEFAULT,
  CAMERA_SPEED_WARP,
  PARTICLE_ALPHA,
  RENDER_DISTANCE_3D,
  WATCH_DISTANCE_MULTIPLIER
} from '@renderer/defaults';
import { speedBase, speedMultiplier, starPositionsInRange } from '@renderer/state';
import { useThrottleFn } from '@vueuse/core';
import { Star } from 'src/types/Star';
import { StarPosition } from 'src/types/StarPosition';

import GalacticScene from './GalacticScene';
import { realToModelSize, realToWorld } from './helper';
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
    if (this.engine.activeRenderLoops.length) {
      return;
    }

    this.galacticScene.initialize();

    this.galacticScene.scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.event.key === 'Shift') {
        if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
          speedMultiplier.value = CAMERA_SPEED_WARP;
        }
        if (kbInfo.type === KeyboardEventTypes.KEYUP) {
          speedMultiplier.value = CAMERA_SPEED_DEFAULT;
        }
        this.galacticScene.camera.speed = speedBase.value * speedMultiplier.value;
        this.planetaryScene.camera.speed = speedBase.value * speedMultiplier.value;
      }
    });

    this.engine.runRenderLoop((): void => {
      const distance = this.planetaryScene.spriteManager
        ? this.planetaryScene.camera.position.negate().length()
        : Infinity;

      // Update on camera movement
      if (!this.lastCameraPosition.equals(this.galacticScene.camera.position)) {
        this.lastCameraPosition = this.galacticScene.camera.position.clone();

        // Check nearby stars
        this.updateStarObjectsThrotteled();

        // Set sprite visibility/transparency
        if (this.planetaryScene.spriteManager) {
          const sprite = this.planetaryScene.spriteManager.sprites.at(0) as Sprite;
          sprite.color.a = distance < PARTICLE_ALPHA ? distance : PARTICLE_ALPHA;

          // Enable/disable meshes based on distance
          const visible = distance <= RENDER_DISTANCE_3D;
          this.planetaryScene.scene.meshes.forEach((mesh) => {
            mesh.isVisible = visible;
          });
          sprite.isVisible = visible;
        }

        // Set base speed
        speedBase.value = distance < 1.0 ? distance : 1.0;
      }

      // Update speed
      this.galacticScene.camera.speed = speedBase.value * speedMultiplier.value;
      this.planetaryScene.camera.speed = speedBase.value * speedMultiplier.value;

      // Render scenes
      this.galacticScene.render();
      this.planetaryScene.render();
    });
  }

  flyTo(target: Star, instantly = false): void {
    console.log(`Flying to star #${target.id}...`);

    const galacticSceneEndFrame = this.galacticScene.camera.setTargetAnimated(
      realToWorld(target.x, target.y, target.z),
      realToModelSize(target) * WATCH_DISTANCE_MULTIPLIER
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
    const renderDistance = RENDER_DISTANCE_3D * 2.0;
    const newNearbyStars = starPositionsInRange.value.filter(
      (starPosition) =>
        Math.abs(starPosition.position.subtract(this.galacticScene.camera.position).length()) <=
        renderDistance
    );

    console.debug(
      `Searching for ${newNearbyStars.length} nearby stars: ${performance.now() - start} ms`
    );

    if (
      newNearbyStars.length !== this.nearbyStars.length ||
      !newNearbyStars.every((starPosition) => this.nearbyStars.includes(starPosition))
    ) {
      this.nearbyStars = newNearbyStars;

      // Initialize close-up
      if (this.nearbyStars.length > 0) {
        console.log(`Initializing close-up of star #${this.nearbyStars[0].star.id}...`);
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
