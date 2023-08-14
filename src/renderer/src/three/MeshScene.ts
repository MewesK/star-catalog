import * as THREE from 'three';

import BaseScene from './BaseScene';
import Canvas from './Canvas';

import { bvToColor } from './helper';
import { sunBwTexture } from './textures';
import { CAMERA_FAR_DEFAULT } from '@renderer/defaults';
import { starsInRange } from '@renderer/state';

export default class MeshScene extends BaseScene {
  static SCALE_MULTIPLIER = 10; // 1 unit = 1/SCALE_MULTIPLIER parsec (pc)

  constructor(canvas: Canvas) {
    super(canvas);
  }

  initialize(): void {
    this.scene.clear();

    this.scene.fog = new THREE.Fog(0x000000, 1, CAMERA_FAR_DEFAULT / 10);

    const geometryPool = [
      { geometry: new THREE.IcosahedronGeometry(100, 16), distance: 50 },
      { geometry: new THREE.IcosahedronGeometry(100, 8), distance: 300 },
      { geometry: new THREE.IcosahedronGeometry(100, 4), distance: 1000 },
      { geometry: new THREE.IcosahedronGeometry(100, 2), distance: 2000 },
      { geometry: new THREE.IcosahedronGeometry(100, 1), distance: 5000 }
    ];
    const materialPool = {} as Record<number, { high: THREE.Material; low: THREE.Material }>;

    starsInRange.value.forEach((star) => {
      if (!star) {
        return;
      }

      if (!materialPool[star.ci]) {
        materialPool[star.ci] = {
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
      for (let i = 0; i < geometryPool.length; i++) {
        const mesh = new THREE.Mesh(
          geometryPool[i].geometry,
          i <= 1 ? materialPool[star.ci].high : materialPool[star.ci].low
        );
        mesh.scale.set(0.02, 0.02, 0.02);
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        starLod.addLevel(mesh, geometryPool[i].distance);
      }
      starLod.position.x = star.x * 200;
      starLod.position.y = star.y * 200;
      starLod.position.z = star.z * 200;
      starLod.updateMatrix();
      starLod.matrixAutoUpdate = false;

      this.scene.add(starLod);
    });
  }

  animate(): void {
    // Do nothing
  }
}
