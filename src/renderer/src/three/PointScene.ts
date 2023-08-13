import * as THREE from 'three';

import BaseScene from './BaseScene';
import Canvas from './Canvas';
import Raycaster from './Raycaster';

import { bvToColor, hygToWorld } from './helper';
import { Star } from 'src/types';
import { starTexture } from './textures';
import {
  FOG_COLOR_DEFAULT,
  FOG_FAR_DEFAULT,
  FOG_NEAR_DEFAULT,
  PARTICLE_SIZE
} from '@renderer/defaults';
import { starsInRange } from '@renderer/state';
import { MOUSEOVER_COLOR } from '@renderer/config';

export default class PointScene extends BaseScene {
  pointerEnterCallback = null as
    | ((index: number, intersection: THREE.Intersection<THREE.Object3D>) => void)
    | null;
  pointerLeaveCallback = null as ((index: number) => void) | null;

  readonly raycaster = new Raycaster();

  private points = null as THREE.Points | null;
  private backupColor = null as THREE.Color | null;
  private backupSize = null as number | null;

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

    this.scene.fog = new THREE.Fog(FOG_COLOR_DEFAULT, FOG_NEAR_DEFAULT, FOG_FAR_DEFAULT);

    const starsInRangeLength = starsInRange.value.length;

    const positions = new Float32Array(starsInRangeLength * 3);
    const colors = new Float32Array(starsInRangeLength * 3);
    const sizes = new Float32Array(starsInRangeLength);

    let star: Star;
    for (let i = 0; i < starsInRangeLength; i++) {
      star = starsInRange.value[i];

      hygToWorld(star.x, star.y, star.z).toArray(positions, i * 3);
      bvToColor(star.ci).toArray(colors, i * 3);

      sizes[i] = PARTICLE_SIZE;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        pointTexture: { value: starTexture },
        alphaTest: { value: 0.9 },
        sizeAttenuation: { value: true }
      },
      vertexShader: `
attribute float size;
attribute vec3 customColor;
varying vec3 vColor;

void main() {
  vColor = customColor;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = size * ( 300.0 / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}`,
      fragmentShader: `
uniform vec3 color;
uniform sampler2D pointTexture;

varying vec3 vColor;

void main() {
	gl_FragColor = vec4( color * vColor, 1.0 );
	gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
}`,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  animate(): void {
    // Raycasting
    if (this.points) {
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
          this.backupColor = new THREE.Color();
          this.backupColor.fromArray(attributes.customColor.array, index * 3);
          new THREE.Color(MOUSEOVER_COLOR.value).toArray(attributes.customColor.array, index * 3);
          attributes.customColor.needsUpdate = true;

          if (this.pointerEnterCallback) {
            this.pointerEnterCallback(index, intersection);
          }
        },
        (index) => {
          // Reset size
          if (this.backupSize) {
            attributes.size.array[index] = this.backupSize;
            attributes.size.needsUpdate = true;
            this.backupSize = null;
          }

          // Reset color
          if (this.backupColor) {
            this.backupColor.toArray(attributes.customColor.array, index * 3);
            attributes.customColor.needsUpdate = true;
            this.backupColor = null;
          }

          if (this.pointerLeaveCallback) {
            this.pointerLeaveCallback(index);
          }
        }
      );
    }
  }

  lookAt(star: Star): void {
    const cameraOffset = new THREE.Vector3(0.0, 0.0, 3.0);
    const objectPosition = hygToWorld(star.x, star.y, star.z);
    this.canvas.camera.position.copy(objectPosition).add(cameraOffset);
    this.canvas.camera.rotation.set(0, 0, 0);
  }
}
