import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { currentStar, selectedStars, stars } from '@renderer/stars';

import sunTextureImage from './assets/2k_sun.jpg';
import sunTextureBwImage from './assets/2k_sun_bw.jpg';
import starImage from './assets/star.png';
import { assignSRGB, bvToColor } from './three/helper';

export let camera: THREE.PerspectiveCamera;
export let controls: MapControls;
export let renderer: THREE.WebGLRenderer;
export let scene: THREE.Scene;
export let stats: Stats;

/**
 * Initializes the canvas.
 */
export function initialize(canvasElement: HTMLCanvasElement, width: number, height: number): void {
  camera = new THREE.PerspectiveCamera(70, width / height, 1, 50000);
  camera.position.z = 0;

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasElement });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  controls = new MapControls(camera, canvasElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 10;
  controls.maxDistance = Infinity;

  stats = new Stats();
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 1, 50000);

  // Animation loop
  function animate(): void {
    controls.update();
    renderer.render(scene, camera);
    stats.update();
    window.requestAnimationFrame(animate);
  }
  animate();
}

/**
 * Initializes the galaxy scene with points.
 */
export function initializeScene(onlyNearbyStars: boolean): void {
  scene.clear();

  const textureLoader = new THREE.TextureLoader();
  const sprite = textureLoader.load(starImage, assignSRGB);

  const materials = {} as Record<number, THREE.PointsMaterial>;
  const vertices = {} as Record<number, number[]>;

  (onlyNearbyStars ? [currentStar.value, ...selectedStars.value] : stars.value).forEach((star) => {
    if (star) {
      if (!materials[star.ci]) {
        materials[star.ci] = new THREE.PointsMaterial({
          color: bvToColor(star.ci),
          size: 0.5 as number,
          map: sprite,
          depthTest: false,
          transparent: true
        });
        vertices[star.ci] = [];
      }

      // Scale coordinates by 100 to put them in units of 1/100th parsecs
      vertices[star.ci].push(star.x * 100, star.y * 100, star.z * 100);
    }
  });

  Object.keys(materials).forEach((ci) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices[ci], 3));

    scene.add(new THREE.Points(geometry, materials[ci]));
  });
}

/**
 * Initializes the galaxy scene with meshes.
 */
export function initializeSceneOld(onlyNearbyStars: boolean): void {
  scene.clear();

  const geometryPool = [
    { geometry: new THREE.IcosahedronGeometry(100, 16), distance: 50 },
    { geometry: new THREE.IcosahedronGeometry(100, 8), distance: 300 },
    { geometry: new THREE.IcosahedronGeometry(100, 4), distance: 1000 },
    { geometry: new THREE.IcosahedronGeometry(100, 2), distance: 2000 },
    { geometry: new THREE.IcosahedronGeometry(100, 1), distance: 5000 }
  ];
  const materialPool = {} as Record<number, { high: THREE.Material; low: THREE.Material }>;

  const textureLoader = new THREE.TextureLoader();
  const texture1 = textureLoader.load(sunTextureImage, assignSRGB);
  texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
  const texture2 = textureLoader.load(sunTextureBwImage, assignSRGB);
  texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;

  (onlyNearbyStars ? [currentStar.value, ...selectedStars.value] : stars.value).forEach((star) => {
    if (!star) {
      return;
    }

    if (!materialPool[star.ci]) {
      materialPool[star.ci] = {
        high: new THREE.MeshLambertMaterial({
          emissive: bvToColor(star.ci),
          emissiveMap: texture1
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

    scene.add(starLod);
  });
}

/**
 * Resizes the canavs.
 */
export function resize(width: number, height: number): void {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
