import { Engine, ParticleSystemSet, Scene, Vector3 } from '@babylonjs/core';
import {
  CAMERA_FOV,
  CAMERA_MAX_Z,
  CAMERA_SENSIBILITY,
  CAMERA_SPEED_DEFAULT,
  WATCH_DISTANCE
} from '@renderer/defaults';

import tStar from '../assets/particle_light.png';
import tSunFlare from '../assets/T_SunFlare.png';
import tSunSurface from '../assets/T_SunSurface.png';
import { AnimatedFlyCamera } from './AnimatedFlyCamera';

export default class PlanetaryScene {
  readonly scene: Scene;
  readonly camera: AnimatedFlyCamera;

  constructor(engine: Engine) {
    this.scene = new Scene(engine);
    this.scene.autoClear = false;

    this.camera = new AnimatedFlyCamera('camera', new Vector3(0, 0, -WATCH_DISTANCE), this.scene);
    this.camera.speed = CAMERA_SPEED_DEFAULT;
    this.camera.fov = CAMERA_FOV;
    this.camera.maxZ = CAMERA_MAX_Z;
    this.camera.angularSensibility = CAMERA_SENSIBILITY;
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(true);
  }

  initialize(): void {
    const size = 0.5;
    ParticleSystemSet.BaseAssetsUrl = '';
    const starParticleSystemSet = ParticleSystemSet.Parse(
      {
        emitter: {
          kind: 'Sphere',
          options: {
            diameter: 1.01 * size,
            segments: 32,
            color: [0.3773, 0.093, 0.0266]
          },
          renderingGroupId: 3
        },
        systems: [
          {
            name: 'sunSystem',
            id: 'sunSystem',
            capacity: 1600,
            renderingGroupId: 3,
            isBillboardBased: false,
            particleEmitterType: {
              type: 'SphereParticleEmitter',
              radius: 0.5 * size,
              radiusRange: 0,
              directionRandomizer: 0
            },
            textureName: '..' + tSunSurface,
            animations: [],
            minAngularSpeed: -0.4,
            maxAngularSpeed: 0.4,
            minSize: 0.2 * size,
            maxSize: 0.35 * size,
            minScaleX: 1,
            maxScaleX: 1,
            minScaleY: 1,
            maxScaleY: 1,
            minEmitPower: 0,
            maxEmitPower: 0,
            minLifeTime: 8,
            maxLifeTime: 8,
            emitRate: 200,
            gravity: [0, 0, 0],
            color1: [1, 1, 1, 1],
            color2: [1, 1, 1, 1],
            colorDead: [0, 0, 0, 1],
            updateSpeed: 0.005,
            targetStopDuration: 0,
            blendMode: 2,
            preWarmCycles: 100,
            preWarmStepOffset: 10,
            minInitialRotation: -6.283185307179586,
            maxInitialRotation: 6.283185307179586,
            colorGradients: [
              {
                gradient: 0,
                color1: [0.8509, 0.4784, 0.1019, 0]
              },
              {
                gradient: 0.4,
                color1: [0.6259, 0.3056, 0.0619, 0.5]
              },
              {
                gradient: 0.5,
                color1: [0.6039, 0.2887, 0.0579, 0.5]
              },
              {
                gradient: 1,
                color1: [0.3207, 0.0713, 0.0075, 0]
              }
            ],
            textureMask: [1, 1, 1, 1],
            customShader: null,
            preventAutoStart: true,
            startSpriteCellID: 0,
            endSpriteCellID: 0,
            spriteCellLoop: true,
            spriteCellChangeSpeed: 0,
            spriteCellWidth: 0,
            spriteCellHeight: 0,
            isAnimationSheetEnabled: false
          },
          {
            name: 'flareParticles',
            id: 'flareParticles',
            capacity: 20,
            renderingGroupId: 2,
            particleEmitterType: {
              type: 'SphereParticleEmitter',
              radius: 0.5 * size,
              radiusRange: 0,
              directionRandomizer: 0
            },
            textureName: '..' + tSunFlare,
            animations: [],
            minAngularSpeed: 0,
            maxAngularSpeed: 0,
            minSize: 0.5 * size,
            maxSize: 0.5 * size,
            minScaleX: 0.5,
            maxScaleX: 1,
            minScaleY: 0.5,
            maxScaleY: 1,
            minEmitPower: 0.001,
            maxEmitPower: 0.01,
            minLifeTime: 10,
            maxLifeTime: 10,
            emitRate: 1,
            gravity: [0, 0, 0],
            color1: [1, 1, 1, 1],
            color2: [1, 1, 1, 1],
            colorDead: [0, 0, 0, 1],
            updateSpeed: 0.01,
            targetStopDuration: 0,
            blendMode: 2,
            preWarmCycles: 100,
            preWarmStepOffset: 10,
            minInitialRotation: -6.283185307179586,
            maxInitialRotation: 6.283185307179586,
            colorGradients: [
              {
                gradient: 0,
                color1: [1, 0.9612, 0.5141, 0]
              },
              {
                gradient: 0.25,
                color1: [0.9058, 0.7152, 0.3825, 1]
              },
              {
                gradient: 1,
                color1: [0.632, 0, 0, 0]
              }
            ],
            sizeGradients: [
              {
                gradient: 0,
                factor1: 0
              },
              {
                gradient: 1,
                factor1: 0.5 * size
              }
            ],
            textureMask: [1, 1, 1, 1],
            customShader: null,
            preventAutoStart: true,
            startSpriteCellID: 0,
            endSpriteCellID: 0,
            spriteCellLoop: true,
            spriteCellChangeSpeed: 0,
            spriteCellWidth: 0,
            spriteCellHeight: 0,
            isAnimationSheetEnabled: false
          },
          {
            name: 'glareParticles',
            id: 'glareParticles',
            renderingGroupId: 1,
            capacity: 600,
            particleEmitterType: {
              type: 'SphereParticleEmitter',
              radius: 0.5 * size,
              radiusRange: 0,
              directionRandomizer: 0
            },
            textureName: '..' + tStar,
            animations: [],
            minAngularSpeed: 0,
            maxAngularSpeed: 0,
            minSize: 0.5 * size,
            maxSize: 0.5 * size,
            minScaleX: 0.25,
            maxScaleX: 1.2,
            minScaleY: 0.75,
            maxScaleY: 3,
            minEmitPower: 0,
            maxEmitPower: 0,
            minLifeTime: 2,
            maxLifeTime: 2,
            emitRate: 300,
            gravity: [0, 0, 0],
            color1: [1, 1, 1, 1],
            color2: [1, 1, 1, 1],
            colorDead: [0, 0, 0, 1],
            updateSpeed: 0.01,
            targetStopDuration: 0,
            blendMode: 2,
            preWarmCycles: 100,
            preWarmStepOffset: 10,
            minInitialRotation: -6.283185307179586,
            maxInitialRotation: 6.283185307179586,
            colorGradients: [
              {
                gradient: 0,
                color1: [0.8509, 0.4784, 0.1019, 0]
              },
              {
                gradient: 0.5,
                color1: [0.6039, 0.2887, 0.0579, 0.12]
              },
              {
                gradient: 1,
                color1: [0.3207, 0.0713, 0.0075, 0]
              }
            ],
            textureMask: [1, 1, 1, 1],
            customShader: null,
            preventAutoStart: true,
            startSpriteCellID: 0,
            endSpriteCellID: 0,
            spriteCellLoop: true,
            spriteCellChangeSpeed: 0,
            spriteCellWidth: 0,
            spriteCellHeight: 0,
            isAnimationSheetEnabled: false
          }
        ]
      },
      this.scene
    );
    starParticleSystemSet.start();
  }
}
