import { Engine } from '@babylonjs/core';
import { Star } from 'src/types/Star';

import GalacticScene from './GalacticScene';
import { hygToWorld } from './helper';
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
      this.galacticScene.scene.render();
      this.planetaryScene.scene.render();
    });
  }

  flyTo(target: Star, instantly = false): void {
    console.log(`Flying to star #${target.id}...`, target);

    const endFrame = this.galacticScene.camera.setTargetAnimated(
      hygToWorld(target.x, target.y, target.z)
    );

    this.galacticScene.scene.beginAnimation(
      this.galacticScene.camera,
      instantly ? endFrame : 0,
      endFrame,
      false
    );
  }
}
