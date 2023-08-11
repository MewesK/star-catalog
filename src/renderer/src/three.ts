import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { currentStar, selectedStars, stars } from '@renderer/stars';

import sunTextureImage from './assets/2k_sun.jpg';
import sunTextureBwImage from './assets/2k_sun_bw.jpg';
import starImage from './assets/star.png';
import { assignSRGB, bvToColor } from './three/helper';
import { Star } from 'src/types';

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
  renderer.autoClear = false;

  controls = new MapControls(camera, canvasElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1;
  controls.maxDistance = 100000;

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

  const _selectedStars = onlyNearbyStars
    ? [currentStar.value, ...selectedStars.value]
    : stars.value;
  const _selectedStarsLength = _selectedStars.length;

  const positions = new Float32Array(_selectedStarsLength * 3);
  const colors = new Float32Array(_selectedStarsLength * 3);
  const sizes = new Float32Array(_selectedStarsLength);

  let star: Star;
  const vertex = new THREE.Vector3();
  for (let i = 0; i < _selectedStarsLength; i++) {
    star = _selectedStars[i];

    // 1/100 parsec
    vertex.x = star.x * 100;
    vertex.y = star.y * 100;
    vertex.z = star.z * 100;
    vertex.toArray(positions, i * 3);

    bvToColor(star.ci).toArray(colors, i * 3);

    sizes[i] = 1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xffffff) },
      pointTexture: { value: sprite }
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

  scene.add(new THREE.Points(geometry, material));
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
