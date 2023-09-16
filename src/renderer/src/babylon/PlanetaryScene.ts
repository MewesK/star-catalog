import { Engine, ParticleSystemSet, Scene, SpriteManager, Vector3 } from '@babylonjs/core';
import {
  CAMERA_FOV,
  CAMERA_SENSIBILITY,
  CAMERA_SPEED_DEFAULT,
  MODEL_SIZE,
  PARTICLE_ALPHA,
  PARTICLE_SIZE,
  RENDER_DISTANCE_3D,
  WATCH_DISTANCE
} from '@renderer/defaults';
import { Star } from 'src/types/Star';

import starTexture from '../assets/particle_light.png';
import tSunFlare from '../assets/T_SunFlare.png';
import tSunSurface from '../assets/T_SunSurface.png';
import { AnimatedFlyCamera } from './AnimatedFlyCamera';
import { bvToColor } from './helper';
import { StarSprite } from './StarSprite';

export default class PlanetaryScene {
  readonly scene: Scene;
  readonly camera: AnimatedFlyCamera;
  spriteManager = null as SpriteManager | null;
  starParticleSystemSet = null as ParticleSystemSet | null;

  constructor(engine: Engine) {
    this.scene = new Scene(engine);
    this.scene.autoClear = false;

    this.camera = new AnimatedFlyCamera('camera', new Vector3(0, 0, -WATCH_DISTANCE), this.scene);
    this.camera.speed = CAMERA_SPEED_DEFAULT;
    this.camera.fov = CAMERA_FOV;
    this.camera.minZ = MODEL_SIZE / 2.0;
    this.camera.maxZ = RENDER_DISTANCE_3D;
    this.camera.angularSensibility = CAMERA_SENSIBILITY;
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(true);

    ParticleSystemSet.BaseAssetsUrl = '';
  }

  dispose(): void {
    if (this.spriteManager) {
      this.spriteManager.dispose();
      this.spriteManager = null;
    }
    if (this.starParticleSystemSet) {
      this.starParticleSystemSet.dispose();
      this.starParticleSystemSet = null;
    }
  }

  initialize(star: Star): void {
    // Clean up
    this.dispose();

    const color = bvToColor(star.ci, PARTICLE_ALPHA);
    const size = star.absmag + 20.0;
    const spriteSize = size * PARTICLE_SIZE;
    const particleSystemSize = size * MODEL_SIZE;

    // Create star sprite
    this.spriteManager = new SpriteManager('closeupStarManager', starTexture, 1, 256, this.scene);
    const starSprite = new StarSprite('closeupStarSprite', star, this.spriteManager);
    starSprite.color = color;
    starSprite.size = spriteSize;

    // Create star particle system set
    this.starParticleSystemSet = ParticleSystemSet.Parse(
      {
        emitter: {
          kind: 'Sphere',
          options: {
            diameter: 1.01 * particleSystemSize,
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
              radius: 0.5 * particleSystemSize,
              radiusRange: 0,
              directionRandomizer: 0
            },
            textureName: '..' + tSunSurface,
            animations: [],
            minAngularSpeed: -0.4,
            maxAngularSpeed: 0.4,
            minSize: 0.2 * particleSystemSize,
            maxSize: 0.35 * particleSystemSize,
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
            isAnimationSheetEnabled: false,
            isLocal: true
          },
          {
            name: 'flareParticles',
            id: 'flareParticles',
            capacity: 20,
            renderingGroupId: 2,
            particleEmitterType: {
              type: 'SphereParticleEmitter',
              radius: 0.5 * particleSystemSize,
              radiusRange: 0,
              directionRandomizer: 0
            },
            textureName: '..' + tSunFlare,
            animations: [],
            minAngularSpeed: 0,
            maxAngularSpeed: 0,
            minSize: 0.5 * particleSystemSize,
            maxSize: 0.5 * particleSystemSize,
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
                factor1: 0.5 * particleSystemSize
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
            isAnimationSheetEnabled: false,
            isLocal: true
          },
          {
            name: 'glareParticles',
            id: 'glareParticles',
            renderingGroupId: 1,
            capacity: 600,
            particleEmitterType: {
              type: 'SphereParticleEmitter',
              radius: 0.5 * particleSystemSize,
              radiusRange: 0,
              directionRandomizer: 0
            },
            textureName: '..' + starTexture,
            animations: [],
            minAngularSpeed: 0,
            maxAngularSpeed: 0,
            minSize: 0.5 * particleSystemSize,
            maxSize: 0.5 * particleSystemSize,
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
            isAnimationSheetEnabled: false,
            isLocal: true
          }
        ]
      },
      this.scene
    );
    this.starParticleSystemSet.start();
  }
}
