import * as THREE from 'three';
import BaseScene from './BaseScene';
import Canvas from './Canvas';
import Raycaster from './Raycaster';
import { bvToColor } from './helper';
import { Star } from 'src/types';
import { starTexture } from './textures';
import { selectedStars } from '@renderer/stars';

export default class PointScene extends BaseScene {
  static PARTICLE_SIZE = 1;
  static SCALE_MULTIPLIER = 10; // 1 unit = 1/SCALE_MULTIPLIER parsec (pc)
  static INTERSECT_COLOR = new THREE.Color(0x00ff00);

  readonly raycaster = new Raycaster();

  private points = null as THREE.Points | null;
  private backupColor = null as THREE.Color | null;
  private backupSize = null as number | null;

  constructor(canvas: Canvas) {
    super(canvas);
  }

  initialize(): void {
    this.scene.fog = new THREE.Fog(0x000000, 1, Canvas.CAMERA_FAR / 10);

    const selectedStarsLength = selectedStars.value.length;

    const positions = new Float32Array(selectedStarsLength * 3);
    const colors = new Float32Array(selectedStarsLength * 3);
    const sizes = new Float32Array(selectedStarsLength);

    let star: Star;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < selectedStarsLength; i++) {
      star = selectedStars.value[i];

      vertex.x = star.x * PointScene.SCALE_MULTIPLIER;
      vertex.y = star.y * PointScene.SCALE_MULTIPLIER;
      vertex.z = star.z * PointScene.SCALE_MULTIPLIER;
      vertex.toArray(positions, i * 3);

      bvToColor(star.ci).toArray(colors, i * 3);

      sizes[i] = PointScene.PARTICLE_SIZE;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        pointTexture: { value: starTexture },
        alphaTest: { value: 0.9 }
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
      //blending: THREE.AdditiveBlending,
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
          PointScene.INTERSECT_COLOR.toArray(attributes.customColor.array, index * 3);
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
}
