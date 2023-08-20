import * as THREE from 'three';

import sunTextureImage from '../assets/2k_sun.jpg';
import sunBwTextureImage from '../assets/2k_sun_bw.jpg';
import cloudTextureImage from '../assets/cloud.png';
import lavaTextureImage from '../assets/lavatile.jpg';
import starTextureImage from '../assets/particle_light.png';

const textureLoader = new THREE.TextureLoader();

export function load(src: string): THREE.Texture {
  return textureLoader.load(src, (texture) => (texture.colorSpace = THREE.SRGBColorSpace));
}

export const cloudTexture = load(cloudTextureImage);
cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
cloudTexture.colorSpace = THREE.NoColorSpace;

export const lavaTexture = load(lavaTextureImage);
lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;

export const sunTexture = load(sunTextureImage);
sunTexture.wrapS = sunTexture.wrapT = THREE.RepeatWrapping;

export const sunBwTexture = load(sunBwTextureImage);
sunBwTexture.wrapS = sunBwTexture.wrapT = THREE.RepeatWrapping;

export const starTexture = load(starTextureImage);
