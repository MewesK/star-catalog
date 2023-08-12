import * as THREE from 'three';

export default class Raycaster {
  private mousePointer = null as THREE.Vector2 | null;
  private readonly raycaster = new THREE.Raycaster();

  private intersectedIndex = null as number | null;

  constructor() {
    this.raycaster.params.Points = { threshold: 0.2 };
  }

  check(
    camera: THREE.Camera,
    points: THREE.Points,
    pointerEnterCallback: (
      starIndex: number,
      intersection: THREE.Intersection<THREE.Object3D>
    ) => void,
    pointerLeaveCallback: (starIndex: number) => void
  ): void {
    if (this.mousePointer === null) {
      return;
    }

    this.raycaster.setFromCamera(this.mousePointer, camera);
    const intersection = this.raycaster.intersectObject(points);
    if (intersection.length > 0) {
      if (this.intersectedIndex != intersection[0].index) {
        if (this.intersectedIndex !== null) {
          pointerLeaveCallback(this.intersectedIndex);
        }
        this.intersectedIndex = intersection[0].index ?? null;
        if (this.intersectedIndex !== null) {
          pointerEnterCallback(this.intersectedIndex, intersection[0]);
        }
      }
    } else if (this.intersectedIndex !== null) {
      pointerLeaveCallback(this.intersectedIndex);
      this.intersectedIndex = null;
    }
  }

  updatePointer(x: number, y: number): void {
    if (this.mousePointer === null) {
      this.mousePointer = new THREE.Vector2();
    }
    this.mousePointer.x = x;
    this.mousePointer.y = y;
  }
}
