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
import { EffectPass, GodRaysEffect } from 'postprocessing';
import { Star } from 'src/types/Star';
import { StarObject } from 'src/types/StarObject';
import { StarPosition } from 'src/types/StarPosition';
import * as THREE from 'three';

import BaseScene from './BaseScene';
import Canvas from './Canvas';
import { bvToColor, hygToWorld } from './helper';
import AnimatedStarMaterial from './materials/AnimatedStarMaterial';
import PointMaterial from './materials/PointMaterial';
import Raycaster, {
  PointerEnterEvent as RaycasterPointerEnterEvent,
  PointerLeaveEvent as RaycasterPointerLeaveEvent
} from './Raycaster';
import { pointTexture, sunTexture, surfaceTexture } from './textures';

export default class PointScene extends BaseScene {
  points = null as THREE.Points | null;
  positions = [] as StarPosition[];
  raycaster = null as Raycaster | null;

  private backupCameraPosition = new THREE.Vector3();
  private backupColor = new THREE.Color();
  private backupSize = 0;

  private nearbyStars = new Map<number, StarObjectEntry>();
  private geometryPool = [
    { geometry: new THREE.IcosahedronGeometry(1, 16), distance: 0 },
    { geometry: new THREE.IcosahedronGeometry(1, 8), distance: 50 },
    { geometry: new THREE.IcosahedronGeometry(1, 1), distance: 100 }
  ];
  private materialPool = {} as Record<number, AnimatedStarMaterial>;

  constructor(canvas: Canvas) {
    super(canvas);
  }

  initialize(): void {
    if (!this.canvas.renderer || !this.canvas.renderPass) {
      throw new Error('Canvas not initialized.');
    }

    // Scene setup
    this.scene.clear();
    this.scene.background = new THREE.Color(0x0000000);
    this.scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);

    if (this.canvas.renderPass.mainScene !== this.scene) {
      this.canvas.renderPass.mainScene = this.scene;
    }

    this.raycaster = new Raycaster();
    this.raycaster.addEventListener(
      'pointerenter',
      this.onPointerEnter.bind(this) as EventListener
    );
    this.raycaster.addEventListener(
      'pointerleave',
      this.onPointerLeave.bind(this) as EventListener
    );

    // Create points
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
  }

  animate(): void {
    // Animate materials
    Object.values(this.materialPool).forEach(
      (material) => (material.uniforms['time'].value += this.clock.getDelta() / 3)
    );

    if (this.points && this.raycaster) {
      // Raycasting
      this.raycaster.check(this.canvas.camera, this.points);

      // Lazy-load/-unload nearby stars
      if (!this.canvas.camera.position.equals(this.backupCameraPosition)) {
        this.updateStarObjectsThrotteled();
      }
    }
  }

  //
  // Raycasting
  //

  onPointerEnter(event: RaycasterPointerEnterEvent): void {
    if (this.points === null) {
      return;
    }

    const index = event.detail.starIndex;
    const intersection = event.detail.intersection;
    const geometry = this.points.geometry;
    const attributes = geometry.attributes;

    // Set size
    this.backupSize = attributes.size.array[index];
    attributes.size.array[index] +=
      attributes.size.array[index] * (intersection.distance / SCALE_MULTIPLIER);
    attributes.size.needsUpdate = true;

    // Set color
    this.backupColor.fromArray(attributes.customColor.array, index * 3);
    new THREE.Color(MOUSEOVER_COLOR).toArray(attributes.customColor.array, index * 3);
    attributes.customColor.needsUpdate = true;

    this.dispatchEvent(new PointerEnterEvent(starsInRange.value[index], intersection));
  }

  onPointerLeave(event: RaycasterPointerLeaveEvent): void {
    if (this.points === null) {
      return;
    }

    const index = event.detail.starIndex;
    const geometry = this.points.geometry;
    const attributes = geometry.attributes;

    // Reset size
    attributes.size.array[index] = this.backupSize;
    attributes.size.needsUpdate = true;

    // Reset color
    this.backupColor.toArray(attributes.customColor.array, index * 3);
    attributes.customColor.needsUpdate = true;

    this.dispatchEvent(new PointerLeaveEvent(starsInRange.value[index]));
  }

  //
  // Star objects
  //

  updateStarObjectsThrotteled = useThrottleFn(this.updateStarObjects, 100);
  updateStarObjects(): void {
    // Find nearby stars
    const start = performance.now();
    const nearbyStars = this.positions
      .filter(
        (position) =>
          Math.abs(position.distanceTo(this.canvas.camera.position)) <= RENDER_DISTANCE_3D
      )
      .map((position) => starsInRange.value[position.starIndex]);
    console.log(`Searching for nearby stars: ${performance.now() - start} ms`);

    // Destroy objects if necessary
    this.nearbyStars.forEach((value, key) => {
      if (!nearbyStars.includes(value.object)) {
        this.destroyStarObject(value);
        this.nearbyStars.delete(key);
      }
    });

    // Create objects if necessary
    for (const newStar of nearbyStars) {
      if (!this.nearbyStars.has(newStar.id)) {
        this.nearbyStars.set(newStar.id, this.createStarObject(newStar));
      }
    }

    this.backupCameraPosition.copy(this.canvas.camera.position);
  }

  createStarObject(star: Star): StarObjectEntry {
    const result = { object: star } as StarObjectEntry;

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
      if (i === 0) {
        result.mesh = mesh;
        result.effect = new EffectPass(
          this.canvas.camera,
          new GodRaysEffect(this.canvas.camera, mesh, {
            decay: 0.85,
            weight: 0.3
          })
        );
        if (this.canvas.composer) {
          this.canvas.composer.addPass(result.effect);
        }
      }
    }

    starLod.updateMatrix();
    starLod.matrixAutoUpdate = false;

    result.lod = starLod;
    this.scene.add(starLod);

    return result;
  }

  destroyStarObject(starObjectEntry: StarObjectEntry): void {
    starObjectEntry.lod.removeFromParent();
    starObjectEntry.effect.dispose();
    if (this.canvas.composer) {
      this.canvas.composer.removePass(starObjectEntry.effect);
    }
  }
}

export class PointerEnterEvent extends CustomEvent<{
  intersection: THREE.Intersection<THREE.Object3D>;
  star: Star;
}> {
  constructor(star: Star, intersection: THREE.Intersection<THREE.Object3D>) {
    super('pointerenter', {
      detail: {
        star,
        intersection
      }
    } as CustomEventInit);
  }
}

export class PointerLeaveEvent extends CustomEvent<{ star: Star }> {
  constructor(star: Star) {
    super('pointerleave', {
      detail: {
        star
      }
    } as CustomEventInit);
  }
}

export interface StarObjectEntry {
  lod: StarObject;
  mesh: THREE.Mesh;
  effect: EffectPass;
  object: Star;
}
