import * as THREE from 'three';

export interface StarPosition extends THREE.Vector3 {
  pointIndex: number;
  starIndex: number;
}
