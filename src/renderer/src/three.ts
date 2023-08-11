import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { currentStar, selectedStars, stars } from '@renderer/stars';
import { assignSRGB, bvToColor } from './three/helper';
import { Star } from 'src/types';

import sunTextureImage from './assets/2k_sun.jpg';
import sunTextureBwImage from './assets/2k_sun_bw.jpg';
import starImage from './assets/star.png';

const CAMERA_FOV = 70;
const CAMERA_NEAR = 1;
const CAMERA_FAR = 50000;
const CAMERA_POSITION_Z = 0;
const FOG = new THREE.Fog(0x000000, 1, CAMERA_FAR / 10);
const PARTICLE_SIZE = 1;
const SCALE_MULTIPLIER = 10; // 1 unit = 1/SCALE_MULTIPLIER parsec (pc)
const INTERSECT_COLOR = new THREE.Color(0x00ff00);
const INTERSECT_SIZE_MULTIPLICATOR = 2;

export let camera: THREE.PerspectiveCamera;
export let controls: MapControls;
export let renderer: THREE.WebGLRenderer;
export let raycaster: THREE.Raycaster;
export let scene: THREE.Scene;
export let stats: Stats;

export let mousePointer: THREE.Vector2;
export let particles: THREE.Points;
export const canvasSize = new THREE.Vector2(0, 0);

let _running = false;
let _intersectedIndex = null as number | null;
let _backupColor = null as THREE.Color | null;
let _backupSize = null as number | null;

/**
 * Initializes the canvas.
 */
export function initialize(canvasElement: HTMLCanvasElement): void {
  camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR);
  camera.position.z = CAMERA_POSITION_Z;

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasElement });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.autoClear = false;

  raycaster = new THREE.Raycaster();
  raycaster.params.Points = { threshold: 0.2 };

  controls = new MapControls(camera, canvasElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2;
  controls.maxDistance = 2 * CAMERA_FAR;

  stats = new Stats();
  scene = new THREE.Scene();
  scene.fog = FOG;
}

/**
 * Initializes the galaxy scene with points.
 */
export function initializeScene(onlyNearbyStars: boolean): void {
  scene.clear();

  const textureLoader = new THREE.TextureLoader();
  const starTexture = textureLoader.load(starImage, assignSRGB);

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

    vertex.x = star.x * SCALE_MULTIPLIER;
    vertex.y = star.y * SCALE_MULTIPLIER;
    vertex.z = star.z * SCALE_MULTIPLIER;
    vertex.toArray(positions, i * 3);

    bvToColor(star.ci).toArray(colors, i * 3);

    sizes[i] = PARTICLE_SIZE;
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

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
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
  canvasSize.width = width;
  canvasSize.height = height;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

export function start(): boolean {
  if (_running) {
    return false;
  }

  _running = true;

  // Animation loop
  function animate(): void {
    window.requestAnimationFrame(animate);

    controls.update();

    // Raycasting
    if (mousePointer && particles) {
      raycaster.setFromCamera(mousePointer, camera);

      const geometry = particles.geometry;
      const attributes = geometry.attributes;
      const intersection = raycaster.intersectObject(particles);

      const resetIntersectedPoint = (): void => {
        if (_intersectedIndex !== null && _backupSize !== null && _backupColor !== null) {
          // Reset size
          attributes.size.array[_intersectedIndex] = _backupSize;
          attributes.size.needsUpdate = true;

          // Reset color
          _backupColor.toArray(attributes.customColor.array, _intersectedIndex * 3);
          attributes.customColor.needsUpdate = true;

          _backupSize = null;
          _backupColor = null;
          _intersectedIndex = null;
        }
      };

      if (intersection.length > 0) {
        if (_intersectedIndex != intersection[0].index) {
          resetIntersectedPoint();

          _intersectedIndex = intersection[0].index ?? null;
          if (_intersectedIndex !== null) {
            console.log('Intersecting!', _intersectedIndex, mousePointer);

            // Backup size
            _backupSize = attributes.size.array[_intersectedIndex];

            // Backup color
            _backupColor = new THREE.Color();
            _backupColor.fromArray(attributes.customColor.array, _intersectedIndex * 3);

            // Set size
            attributes.size.array[_intersectedIndex] *= INTERSECT_SIZE_MULTIPLICATOR;
            attributes.size.needsUpdate = true;

            // Set color
            INTERSECT_COLOR.toArray(attributes.customColor.array, _intersectedIndex * 3);
            attributes.customColor.needsUpdate = true;
          }
        }
      } else if (_intersectedIndex !== null) {
        resetIntersectedPoint();
      }
    }

    renderer.render(scene, camera);
    stats.update();
  }
  animate();

  return true;
}

export function updatePointer(x: number, y: number): void {
  if (!mousePointer) {
    mousePointer = new THREE.Vector2(0, 0);
  }
  mousePointer.x = (x / canvasSize.width) * 2 - 1;
  mousePointer.y = -(y / canvasSize.height) * 2 + 1;
}
