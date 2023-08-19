import * as THREE from 'three';

import sunTextureImage from '../assets/2k_sun.jpg';
import sunBwTextureImage from '../assets/2k_sun_bw.jpg';
import starTextureImage from '../assets/particle_light.png';

const textureLoader = new THREE.TextureLoader();

export function load(src: string): THREE.Texture {
  return textureLoader.load(src, (texture) => (texture.colorSpace = THREE.SRGBColorSpace));
}

export const sunTexture = load(sunTextureImage);
export const sunBwTexture = load(sunBwTextureImage);
export const starTexture = load(starTextureImage);
