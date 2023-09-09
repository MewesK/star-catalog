import {
  Animation,
  Epsilon,
  FlyCamera,
  Matrix,
  Nullable,
  PostProcess,
  Vector3
} from '@babylonjs/core';
import { TRAVEL_TIME, WATCH_DISTANCE } from '@renderer/defaults';

export class AnimatedFlyCamera extends FlyCamera {
  getFirstPostProcess(): Nullable<PostProcess> {
    return this._getFirstPostProcess();
  }
  
  getLastPostProcess(): Nullable<PostProcess> {
    for (let ppIndex = this._postProcesses.length - 1; ppIndex >= 0; ppIndex--) {
      if (this._postProcesses[ppIndex] !== null) {
        return this._postProcesses[ppIndex];
      }
    }
    return null;
  }

  setTargetAnimated(target: Vector3): number {
    // Position
    const targetPosition = this.position
      .subtract(target)
      .normalize()
      .scaleInPlace(WATCH_DISTANCE)
      .add(target);

    if (targetPosition.z === target.z) {
      targetPosition.z += Epsilon;
    }

    // Rotation
    const rotationMatrix = Matrix.LookAtLH(targetPosition, target, Vector3.Up()).invert();
    const targetRotation = new Vector3(Math.atan(rotationMatrix.m[6] / rotationMatrix.m[10]), 0, 0);

    const direction = target.subtract(targetPosition);
    if (direction.x >= 0.0) {
      targetRotation.y = -Math.atan(direction.z / direction.x) + Math.PI / 2.0;
    } else {
      targetRotation.y = -Math.atan(direction.z / direction.x) - Math.PI / 2.0;
    }

    if (isNaN(targetRotation.x)) {
      targetRotation.x = 0;
    }
    if (isNaN(targetRotation.y)) {
      targetRotation.y = 0;
    }

    // Animations
    const frameRate = 30;
    const endFrame = frameRate * TRAVEL_TIME;

    const positionAnimation = new Animation(
      'positionAnimation',
      'position',
      frameRate,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    positionAnimation.setKeys([
      {
        frame: 0,
        value: this.position
      },
      {
        frame: endFrame,
        value: targetPosition
      }
    ]);
    this.animations.push(positionAnimation);

    const rotationAnimation = new Animation(
      'rotationAnimation',
      'rotation',
      frameRate,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    rotationAnimation.setKeys([
      {
        frame: 0,
        value: this.rotation
      },
      {
        frame: endFrame,
        value: targetRotation
      }
    ]);
    this.animations.push(rotationAnimation);

    return endFrame;
  }
}
