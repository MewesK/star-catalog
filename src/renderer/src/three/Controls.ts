import { MapControls } from 'three/examples/jsm/controls/MapControls';
import Canvas from './Canvas';

export default class Controls {
  private readonly controls: MapControls;

  constructor(screen: Canvas, minDistance: number, maxDistance: number) {
    this.controls = new MapControls(screen.camera, screen.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = minDistance;
    this.controls.maxDistance = maxDistance;
  }

  update(): boolean {
    return this.controls.update();
  }
}
