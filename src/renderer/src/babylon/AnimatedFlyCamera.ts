import {
  Animation,
  CircleEase,
  CubicEase,
  EasingFunction,
  Epsilon,
  FlyCamera,
  Matrix,
  Vector3
} from '@babylonjs/core';
import { TRAVEL_TIME } from '@renderer/defaults';

export class AnimatedFlyCamera extends FlyCamera {
  setTargetAnimated(target: Vector3, distance: number): number {
    // Position
    const targetPosition = this.position
      .subtract(target)
      .normalize()
      .scaleInPlace(distance)
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

    const positionEasingFunction = new CubicEase();
    positionEasingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    positionAnimation.setEasingFunction(positionEasingFunction);

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

    const rotationEasingFunction = new CircleEase();
    rotationEasingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    rotationAnimation.setEasingFunction(rotationEasingFunction);

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
