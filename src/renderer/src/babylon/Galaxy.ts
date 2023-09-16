import { Engine } from '@babylonjs/core';
import { RENDER_DISTANCE_3D } from '@renderer/defaults';
import { starPositionsInRange } from '@renderer/state';
import { useThrottleFn } from '@vueuse/core';
import { Star } from 'src/types/Star';

import GalacticScene from './GalacticScene';
import { realToWorld } from './helper';
import PlanetaryScene from './PlanetaryScene';

export default class Galaxy {
  readonly engine: Engine;
  readonly galacticScene: GalacticScene;
  readonly planetaryScene: PlanetaryScene;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true);
    this.planetaryScene = new PlanetaryScene(this.engine);
    this.galacticScene = new GalacticScene(this.engine);
  }

  initialize(): void {
    this.galacticScene.initialize();
    this.planetaryScene.initialize();

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

    const planetarySceneEndFrame = this.planetaryScene.camera.setTargetAnimated(
      realToWorld(target.x, target.y, target.z)
    );
    this.planetaryScene.scene.beginAnimation(
      this.planetaryScene.camera,
      instantly ? planetarySceneEndFrame : 0,
      planetarySceneEndFrame,
      false
    );
  }

  updateStarObjectsThrotteled = useThrottleFn(this.updateStarObjects, 2500);
  updateStarObjects(): void {
    // Find nearby stars
    const start = performance.now();
    const newNearbyStars = starPositionsInRange.value.filter(
      (position) =>
        Math.abs(position.subtract(this.galacticScene.camera.position).length()) <=
        RENDER_DISTANCE_3D
    );

    console.log(
      `Searching for ${newNearbyStars.length} nearby stars: ${performance.now() - start} ms`
    );
  }
}
