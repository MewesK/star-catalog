import * as THREE from 'three';
import { kdTree } from 'kd-tree-javascript/kdTree';

import BaseScene from './BaseScene';
import Canvas from './Canvas';
import Raycaster from './Raycaster';

import { bvToColor, hygToWorld } from './helper';
import { Star } from 'src/types/Star';
import { starTexture, sunBwTexture } from './textures';
import {
  FOG_COLOR_DEFAULT,
  FOG_FAR_DEFAULT,
  FOG_NEAR_DEFAULT,
  MOUSEOVER_COLOR_DEFAULT,
  PARTICLE_SIZE
} from '@renderer/defaults';
import { stars, starsInRange } from '@renderer/state';

export default class PointScene extends BaseScene {
  pointerEnterCallback = null as
    | ((star: Star, intersection: THREE.Intersection<THREE.Object3D>) => void)
    | null;
  pointerLeaveCallback = null as ((star: Star) => void) | null;

  points = null as THREE.Points | null;
  raycaster = null as Raycaster | null;

  private backupCameraPosition = new THREE.Vector3();
  private backupColor = new THREE.Color();
  private backupCoords = [] as THREE.Vector3[];
  private backupNearbyStars = [] as Star[];
  private backupSize = 0;

  private geometryPool = [
    { geometry: new THREE.IcosahedronGeometry(1, 3), distance: 0 },
    { geometry: new THREE.IcosahedronGeometry(1, 2), distance: 50 },
    { geometry: new THREE.IcosahedronGeometry(1, 1), distance: 100 }
  ];
  private materialPool = {} as Record<number, { high: THREE.Material; low: THREE.Material }>;

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
    this.scene.fog = new THREE.Fog(FOG_COLOR_DEFAULT, FOG_NEAR_DEFAULT, FOG_FAR_DEFAULT);

    this.raycaster = new Raycaster();

    const starsInRangeLength = starsInRange.value.size;

    this.backupCoords = new Array<THREE.Vector3>(starsInRangeLength);
    const positions = new Float32Array(starsInRangeLength * 3);
    const colors = new Float32Array(starsInRangeLength * 3);
    const sizes = new Float32Array(starsInRangeLength);
    const alphas = new Float32Array(starsInRangeLength);

    let i = 0;
    starsInRange.value.forEach((value, key) => {
      // Position
      this.backupCoords[i] = hygToWorld(value.x, value.y, value.z);
      this.backupCoords[i].toArray(positions, i * 3);
      this.backupCoords[i].pointIndex = i;
      this.backupCoords[i].starIndex = key;
      // Color
      bvToColor(value.ci).toArray(colors, i * 3);
      // Size
      sizes[i] = PARTICLE_SIZE - (0.5 + Math.random()) / 2;
      // Alpha
      alphas[i] = 0.75 + Math.random() / 4;
      i++;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setDrawRange(0, Infinity);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        pointTexture: { value: starTexture },
        alphaTest: { value: 0.9 },
        fogColor: { value: this.scene.fog.color },
        fogNear: { value: (this.scene.fog as THREE.Fog).near },
        fogFar: { value: (this.scene.fog as THREE.Fog).far }
      },
      vertexShader: `
attribute float alpha;
attribute float size;
attribute vec3 customColor;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vColor = customColor;
  vAlpha = alpha;

  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

  gl_PointSize = size * ( 300.0 / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}`,
      fragmentShader: `
uniform vec3 color;
uniform sampler2D pointTexture;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying vec3 vColor;
varying float vAlpha;

void main() {
	gl_FragColor = vec4( vColor, vAlpha );
	gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
  #ifdef USE_FOG
    #ifdef USE_LOGDEPTHBUF_EXT
      float depth = gl_FragDepthEXT / gl_FragCoord.w;
    #else
      float depth = gl_FragCoord.z / gl_FragCoord.w;
    #endif
    float fogFactor = smoothstep( fogNear, fogFar, depth );
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
  #endif
}`,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      fog: true
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  animate(): void {
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
          attributes.size.array[index] += Math.log2(Math.pow(intersection.distance, 2) + 1) / 10;
          attributes.size.needsUpdate = true;

          // Set color
          this.backupColor.fromArray(attributes.customColor.array, index * 3);
          new THREE.Color(MOUSEOVER_COLOR_DEFAULT).toArray(attributes.customColor.array, index * 3);
          attributes.customColor.needsUpdate = true;

          if (this.pointerEnterCallback) {
            this.pointerEnterCallback(
              starsInRange.value.get(
                this.backupCoords.find((coord) => coord.pointIndex === index).starIndex
              ) as Star,
              intersection
            );
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
            this.pointerLeaveCallback(
              starsInRange.value.get(
                this.backupCoords.find((coord) => coord.pointIndex === index).starIndex
              ) as Star
            );
          }
        }
      );

      // Lazy-load/-unload nearby stars
      if (
        !this.canvas.camera.position.equals(this.backupCameraPosition) &&
        this.canvas.flightTween === null
      ) {
        // Find nearby stars
        const nearbyStars = this.backupCoords
          .filter((coord) => Math.abs(coord.distanceTo(this.canvas.camera.position)) <= 10)
          // @ts-ignore (hack)
          .map((coord) => starsInRange.value.get(coord.starIndex) as Star);

        /*console.log(
          this.canvas.camera.position,
          nearbyStars,
          this.backupCoords.filter(
            (coord) => Math.abs(coord.distanceTo(this.canvas.camera.position)) <= 10
          )
        );*/

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
      }
    }
  }

  createStarObject(star: Star): void {
    if (!this.materialPool[star.ci]) {
      this.materialPool[star.ci] = {
        high: new THREE.MeshLambertMaterial({
          emissive: bvToColor(star.ci),
          emissiveMap: sunBwTexture
        }),
        low: new THREE.MeshLambertMaterial({
          emissive: bvToColor(star.ci)
        })
      };
    }

    const starLod = new THREE.LOD();
    for (let i = 0; i < this.geometryPool.length; i++) {
      const mesh = new THREE.Mesh(this.geometryPool[i].geometry, this.materialPool[star.ci].high);
      mesh.scale.set(0.1, 0.1, 0.1);
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
      starLod.addLevel(mesh, this.geometryPool[i].distance);
    }
    starLod.position.copy(hygToWorld(star.x, star.y, star.z));
    starLod.updateMatrix();
    starLod.matrixAutoUpdate = false;
    // @ts-ignore (hack)
    starLod.starId = star.id;

    this.scene.add(starLod);
  }

  destroyStarObject(star: Star): void {
    for (const child of this.scene.children) {
      // @ts-ignore (hack)
      if (child.starId === star.id) {
        child.removeFromParent();
      }
    }
  }
}
