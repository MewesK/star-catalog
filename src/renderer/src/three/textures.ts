import * as THREE from 'three';

import sunTextureImage from '../assets/2k_sun_alpha.png';
import sunBwTextureImage from '../assets/2k_sun_bw.jpg';
import pointTextureImage from '../assets/particle_medium.png';
import surfaceTextureImage from '../assets/sun_surface_nso_reimagined_bw.png';

const textureLoader = new THREE.TextureLoader();

export function load(src: string): THREE.Texture {
  return textureLoader.load(src, (texture) => (texture.colorSpace = THREE.SRGBColorSpace));
}

export const surfaceTexture = load(surfaceTextureImage);
surfaceTexture.wrapS = surfaceTexture.wrapT = THREE.RepeatWrapping;

export const sunTexture = load(sunTextureImage);
sunTexture.wrapS = sunTexture.wrapT = THREE.RepeatWrapping;

export const sunBwTexture = load(sunBwTextureImage);
sunBwTexture.wrapS = sunBwTexture.wrapT = THREE.RepeatWrapping;

export const pointTexture = load(pointTextureImage);
