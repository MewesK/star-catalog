import * as THREE from 'three';

import { sunBwTexture } from '../textures';

export default class StaticStarMaterial extends THREE.MeshLambertMaterial {
  constructor(color: THREE.Color) {
    super({
      emissive: color,
      emissiveMap: sunBwTexture
    });
  }
}
