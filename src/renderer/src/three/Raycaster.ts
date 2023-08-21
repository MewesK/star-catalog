import { RAYCASTER_THRESHOLD } from '@renderer/defaults';
import * as THREE from 'three';

export default class Raycaster extends EventTarget {
  private pointer = null as THREE.Vector2 | null;
  private readonly raycaster = new THREE.Raycaster();

  private intersectedIndex = null as number | null;

  constructor() {
    super();
    this.raycaster.params.Points = { threshold: RAYCASTER_THRESHOLD };
  }

  check(camera: THREE.Camera, points: THREE.Points): void {
    if (this.pointer === null) {
      return;
    }

    this.raycaster.setFromCamera(this.pointer, camera);
    const intersections = this.raycaster.intersectObject(points);
    if (intersections.length > 0) {
      if (this.intersectedIndex != intersections[0].index) {
        if (this.intersectedIndex !== null) {
          this.dispatchEvent(new PointerLeaveEvent(this.intersectedIndex));
        }
        this.intersectedIndex = intersections[0].index ?? null;
        if (this.intersectedIndex !== null) {
          this.dispatchEvent(new PointerEnterEvent(this.intersectedIndex, intersections[0]));
        }
      }
    } else if (this.intersectedIndex !== null) {
      this.dispatchEvent(new PointerLeaveEvent(this.intersectedIndex));
      this.intersectedIndex = null;
    }
  }

  updatePointer(x: number, y: number): void {
    if (this.pointer === null) {
      this.pointer = new THREE.Vector2();
    }
    this.pointer.x = x;
    this.pointer.y = y;
  }
}

export class PointerEnterEvent extends CustomEvent<{
  intersection: THREE.Intersection<THREE.Object3D>;
  starIndex: number;
}> {
  constructor(starIndex: number, intersection: THREE.Intersection<THREE.Object3D>) {
    super('pointerenter', {
      detail: {
        starIndex,
        intersection
      }
    } as CustomEventInit);
  }
}

export class PointerLeaveEvent extends CustomEvent<{ starIndex: number }> {
  constructor(starIndex: number) {
    super('pointerleave', {
      detail: {
        starIndex
      }
    } as CustomEventInit);
  }
}
