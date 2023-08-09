import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { currentStar, selectedStars, stars } from '@renderer/stars';

export let camera: THREE.PerspectiveCamera;
export let controls: MapControls;
export let renderer: THREE.WebGLRenderer;
export let scene: THREE.Scene;
export let stats: Stats;

const geometryPool = [
  { geometry: new THREE.IcosahedronGeometry(100, 16), distance: 50 },
  { geometry: new THREE.IcosahedronGeometry(100, 8), distance: 300 },
  { geometry: new THREE.IcosahedronGeometry(100, 4), distance: 1000 },
  { geometry: new THREE.IcosahedronGeometry(100, 2), distance: 2000 },
  { geometry: new THREE.IcosahedronGeometry(100, 1), distance: 5000 }
];
const materialPool = {} as Record<number, THREE.Material>;

/**
 * Initializes the canvas.
 */
export function initialize(canvasElement: HTMLCanvasElement, width: number, height: number): void {
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 15000);
  camera.position.z = 0;

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasElement });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  controls = new MapControls(camera, canvasElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 10;
  controls.maxDistance = Infinity;
  controls.maxPolarAngle = Math.PI / 2;

  stats = new Stats();
  scene = new THREE.Scene();

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
 * Initializes the galaxy scene.
 */
export function initializeScene(onlyNearbyStars: boolean): void {
  scene.clear();

  (onlyNearbyStars ? [currentStar.value, ...selectedStars.value] : stars.value).forEach((star) => {
    if (!star) {
      return;
    }

    if (!materialPool[star.ci]) {
      materialPool[star.ci] = new THREE.MeshBasicMaterial({ color: bvToColor(star.ci) });
    }

    const starLod = new THREE.LOD();
    for (let i = 0; i < 3; i++) {
      const mesh = new THREE.Mesh(geometryPool[i].geometry, materialPool[star.ci]);
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

  console.log(Object.keys(materialPool).length);
}

/**
 * Resizes the canavs.
 */
export function resize(width: number, height: number): void {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

/**
 * Converts B-V index (-0.4 to +2.0) to a THREE.js color
 * @see https://stackoverflow.com/questions/21977786/star-b-v-color-index-to-apparent-rgb-color
 */
function bvToColor(bv: number): THREE.Color {
  let t: number,
    r = 0.0,
    g = 0.0,
    b = 0.0;
  if (bv < -0.4) bv = -0.4;
  if (bv > 2.0) bv = 2.0;
  if (bv >= -0.4 && bv < 0.0) {
    t = (bv + 0.4) / (0.0 + 0.4);
    r = 0.61 + 0.11 * t + 0.1 * t * t;
  } else if (bv >= 0.0 && bv < 0.4) {
    t = (bv - 0.0) / (0.4 - 0.0);
    r = 0.83 + 0.17 * t;
  } else if (bv >= 0.4 && bv < 2.1) {
    t = (bv - 0.4) / (2.1 - 0.4);
    r = 1.0;
  }
  if (bv >= -0.4 && bv < 0.0) {
    t = (bv + 0.4) / (0.0 + 0.4);
    g = 0.7 + 0.07 * t + 0.1 * t * t;
  } else if (bv >= 0.0 && bv < 0.4) {
    t = (bv - 0.0) / (0.4 - 0.0);
    g = 0.87 + 0.11 * t;
  } else if (bv >= 0.4 && bv < 1.6) {
    t = (bv - 0.4) / (1.6 - 0.4);
    g = 0.98 - 0.16 * t;
  } else if (bv >= 1.6 && bv < 2.0) {
    t = (bv - 1.6) / (2.0 - 1.6);
    g = 0.82 - 0.5 * t * t;
  }
  if (bv >= -0.4 && bv < 0.4) {
    t = (bv + 0.4) / (0.4 + 0.4);
    b = 1.0;
  } else if (bv >= 0.4 && bv < 1.5) {
    t = (bv - 0.4) / (1.5 - 0.4);
    b = 1.0 - 0.47 * t + 0.1 * t * t;
  } else if (bv >= 1.5 && bv < 1.94) {
    t = (bv - 1.5) / (1.94 - 1.5);
    b = 0.63 - 0.6 * t * t;
  }
  return new THREE.Color(r, g, b);
}
