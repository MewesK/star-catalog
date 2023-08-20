import {
  FOG_COLOR,
  FOG_FAR,
  FOG_NEAR,
  MODEL_SCALE,
  MOUSEOVER_COLOR,
  PARTICLE_ALPHA,
  PARTICLE_SIZE,
  RENDER_DISTANCE_3D,
  SCALE_MULTIPLIER
} from '@renderer/defaults';
import { starsInRange } from '@renderer/state';
import { useThrottleFn } from '@vueuse/core';
import { Star } from 'src/types/Star';
import { StarObject } from 'src/types/StarObject';
import { StarPosition } from 'src/types/StarPosition';
import * as THREE from 'three';

import BaseScene from './BaseScene';
import Canvas from './Canvas';
import { bvToColor, hygToWorld } from './helper';
import AnimatedStarMaterial from './materials/AnimatedStarMaterial';
import PointMaterial from './materials/PointMaterial';
import Raycaster from './Raycaster';
import { pointTexture, sunTexture, surfaceTexture } from './textures';

export default class PointScene extends BaseScene {
  pointerEnterCallback = null as
    | ((star: Star, intersection: THREE.Intersection<THREE.Object3D>) => void)
    | null;
  pointerLeaveCallback = null as ((star: Star) => void) | null;

  points = null as THREE.Points | null;
  positions = [] as StarPosition[];
  raycaster = null as Raycaster | null;

  private backupCameraPosition = new THREE.Vector3();
  private backupColor = new THREE.Color();
  private backupNearbyStars = [] as Star[];
  private backupSize = 0;

  private geometryPool = [
    { geometry: new THREE.IcosahedronGeometry(1, 16), distance: 0 },
    { geometry: new THREE.IcosahedronGeometry(1, 8), distance: 50 },
    { geometry: new THREE.IcosahedronGeometry(1, 1), distance: 100 }
  ];
  private materialPool = {} as Record<number, AnimatedStarMaterial>;
  private loadStarModels;

  constructor(canvas: Canvas) {
    super(canvas);
  }

  initialize(): void {
    if (!this.canvas.renderer || !this.canvas.renderPass) {
      throw new Error('Canvas not initialized.');
    }

    this.scene.clear();

    if (this.canvas.renderPass.mainScene !== this.scene) {
      this.canvas.renderPass.mainScene = this.scene;
    }

    this.scene.background = new THREE.Color(0x0000000);
    this.scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);

    this.raycaster = new Raycaster();

    const starsInRangeLength = starsInRange.value.length;

    this.positions = new Array<StarPosition>(starsInRangeLength);
    const positions = new Float32Array(starsInRangeLength * 3);
    const colors = new Float32Array(starsInRangeLength * 3);
    const sizes = new Float32Array(starsInRangeLength);
    const alphas = new Float32Array(starsInRangeLength);

    for (let i = 0; i < starsInRangeLength; i++) {
      const star = starsInRange.value[i];

      // Position
      this.positions[i] = hygToWorld(star.x, star.y, star.z) as StarPosition;
      this.positions[i].toArray(positions, i * 3);
      this.positions[i].starIndex = i;

      // Color
      bvToColor(star.ci).toArray(colors, i * 3);

      // Size
      sizes[i] = PARTICLE_SIZE;

      // Alpha
      alphas[i] = PARTICLE_ALPHA;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setDrawRange(0, Infinity);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    const material = new PointMaterial({
      color: { value: new THREE.Color(0xffffff) },
      pointTexture: { value: pointTexture },
      alphaTest: { value: 0.9 },
      fogColor: { value: this.scene.fog.color },
      fogNear: { value: (this.scene.fog as THREE.Fog).near },
      fogFar: { value: (this.scene.fog as THREE.Fog).far }
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);

    this.loadStarModels = useThrottleFn((): void => {
      // Find nearby stars
      const start = performance.now();
      const nearbyStars = this.positions
        .filter(
          (position) =>
            Math.abs(position.distanceTo(this.canvas.camera.position)) <= RENDER_DISTANCE_3D
        )
        .map((position) => starsInRange.value[position.starIndex]);
      console.log(`Searching for nearby stars: ${performance.now() - start} ms`);

      // Create objects if necessary
      for (const newStar of nearbyStars) {
        if (!this.backupNearbyStars.includes(newStar)) {
          this.createStarObject(newStar);
        }
      }

      // Destroy objects if necessary
      for (const oldStar of this.backupNearbyStars) {
        if (!nearbyStars.includes(oldStar)) {
          this.destroyStarObject(oldStar);
        }
      }

      this.backupCameraPosition.copy(this.canvas.camera.position);
      this.backupNearbyStars = nearbyStars;
    }, 100);
  }

  animate(): void {
    Object.values(this.materialPool).forEach(
      (material) => (material.uniforms['time'].value += this.clock.getDelta() / 3)
    );

    if (this.points && this.raycaster) {
      // Raycasting
      const geometry = this.points.geometry;
      const attributes = geometry.attributes;

      this.raycaster.check(
        this.canvas.camera,
        this.points,
        (index, intersection) => {
          // Set size
          this.backupSize = attributes.size.array[index];
          attributes.size.array[index] +=
            attributes.size.array[index] * (intersection.distance / SCALE_MULTIPLIER);
          attributes.size.needsUpdate = true;

          // Set color
          this.backupColor.fromArray(attributes.customColor.array, index * 3);
          new THREE.Color(MOUSEOVER_COLOR).toArray(attributes.customColor.array, index * 3);
          attributes.customColor.needsUpdate = true;

          if (this.pointerEnterCallback) {
            this.pointerEnterCallback(starsInRange.value[index], intersection);
          }
        },
        (index) => {
          // Reset size
          attributes.size.array[index] = this.backupSize;
          attributes.size.needsUpdate = true;

          // Reset color
          this.backupColor.toArray(attributes.customColor.array, index * 3);
          attributes.customColor.needsUpdate = true;

          if (this.pointerLeaveCallback) {
            this.pointerLeaveCallback(starsInRange.value[index]);
          }
        }
      );

      // Lazy-load/-unload nearby stars
      if (!this.canvas.camera.position.equals(this.backupCameraPosition)) {
        this.loadStarModels();
      }
    }
  }

  createStarObject(star: Star): void {
    if (!this.materialPool[star.ci]) {
      this.materialPool[star.ci] = new AnimatedStarMaterial({
        emissive: { value: bvToColor(star.ci) }, // TODO
        emissiveMap: { value: surfaceTexture }, // TODO
        fogDensity: { value: 0.02 },
        fogColor: { value: new THREE.Vector3(0, 0, 0) },
        time: { value: 1.0 },
        uvScale: { value: new THREE.Vector2(3.0, 1.0) },
        texture1: { value: sunTexture },
        texture2: { value: surfaceTexture }
      });
    }

    const starLod = new THREE.LOD() as StarObject;
    starLod.starId = star.id;
    starLod.position.copy(hygToWorld(star.x, star.y, star.z));

    for (let i = 0; i < this.geometryPool.length; i++) {
      const mesh = new THREE.Mesh(this.geometryPool[i].geometry, this.materialPool[star.ci]);
      mesh.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
      starLod.addLevel(mesh, this.geometryPool[i].distance);
    }

    starLod.updateMatrix();
    starLod.matrixAutoUpdate = false;

    this.scene.add(starLod);
  }

  destroyStarObject(star: Star): void {
    for (const child of this.scene.children) {
      if ((child as StarObject).starId === star.id) {
        child.removeFromParent();
        break;
      }
    }
  }
}