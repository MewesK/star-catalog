import * as THREE from 'three';

import BaseScene from './BaseScene';
import Canvas from './Canvas';
import Raycaster from './Raycaster';
import Nearby, { Box, BoxObject } from './Nearby';

import { bvToColor, hygToWorld } from './helper';
import { Star } from 'src/types/Star';
import { starTexture } from './textures';
import {
  FOG_COLOR_DEFAULT,
  FOG_FAR_DEFAULT,
  FOG_NEAR_DEFAULT,
  MAX_RENDER_DISTANCE,
  MOUSEOVER_COLOR_DEFAULT,
  PARTICLE_SIZE
} from '@renderer/defaults';
import { stars, starsInRange } from '@renderer/state';

export default class PointScene extends BaseScene {
  pointerEnterCallback = null as
    | ((index: number, intersection: THREE.Intersection<THREE.Object3D>) => void)
    | null;
  pointerLeaveCallback = null as ((index: number) => void) | null;

  nearby = null as Nearby | null;
  points = null as THREE.Points | null;
  raycaster = null as Raycaster | null;

  private backupColor = new THREE.Color();
  private backupNearbyStars = [] as Star[];
  private backupSize = 0;

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

    this.nearby = new Nearby(MAX_RENDER_DISTANCE, MAX_RENDER_DISTANCE, MAX_RENDER_DISTANCE);
    this.raycaster = new Raycaster();

    const starsInRangeLength = starsInRange.value.length;

    const positions = new Float32Array(starsInRangeLength * 3);
    const colors = new Float32Array(starsInRangeLength * 3);
    const sizes = new Float32Array(starsInRangeLength);
    const alphas = new Float32Array(starsInRangeLength);

    let star: Star;
    for (let i = 0; i < starsInRangeLength; i++) {
      star = starsInRange.value[i];

      hygToWorld(star.x, star.y, star.z).toArray(positions, i * 3);
      bvToColor(star.ci).toArray(colors, i * 3);

      sizes[i] = PARTICLE_SIZE - (0.5 + Math.random()) / 2;
      alphas[i] = 0.75 + Math.random() / 4;

      this.nearby.insert(
        new BoxObject(
          i,
          new Box(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2],
            sizes[i],
            sizes[i],
            sizes[i]
          )
        )
      );
    }

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
    if (this.points && this.raycaster && this.nearby) {
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
            this.pointerEnterCallback(index, intersection);
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
            this.pointerLeaveCallback(index);
          }
        }
      );

      // Nearby star search
      const nearbyBoxObjects = this.nearby.query(
        this.canvas.camera.position.x,
        this.canvas.camera.position.y,
        this.canvas.camera.position.z
      );
      const nearbyStars = [] as Star[];
      for (const boxObject of nearbyBoxObjects.keys()) {
        nearbyStars.push(stars.value[boxObject.id]);
      }
      this.backupNearbyStars = nearbyStars;
    }
  }
}
