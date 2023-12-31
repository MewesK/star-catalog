import { DISTANCE_MULTIPLIER, ZOOM_MULTIPLIER } from '@renderer/defaults';
import * as THREE from 'three';

/**
 * Converts B-V index (-0.4 to +2.0) to a THREE.js color
 * @see https://stackoverflow.com/questions/21977786/star-b-v-color-index-to-apparent-rgb-color
 */
export function bvToColor(bv: number): THREE.Color {
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

/**
 * Converts parsec (pc) to light years (ly).
 * @see https://en.wikipedia.org/wiki/Parsec
 */
export function pcToLy(pc: number): number {
  return pc * 3.26156;
}

/**
 * Converts light years (ly) to parsec (pc).
 * @see https://en.wikipedia.org/wiki/Light-year
 */
export function lyToPc(ly: number): number {
  return ly / 3.26156;
}

export function screenToDevice(x: number, y: number, bounds: DOMRect): THREE.Vector3 {
  return new THREE.Vector3(
    ((x - bounds.x) / bounds.width) * 2 - 1,
    -((y - bounds.y) / bounds.height) * 2 + 1,
    0
  );
}

export function deviceToScreen(x: number, y: number, bounds: DOMRect): THREE.Vector2 {
  return new THREE.Vector2(
    ((x + 1) * bounds.width) / 2 + bounds.x,
    (-(y - 1) * bounds.height) / 2 + bounds.y
  );
}

export function hygToWorld(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(
    x * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER,
    y * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER,
    z * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER
  );
}

export function onShaderError(
  gl: WebGLRenderingContext,
  _program: WebGLProgram,
  glVertexShader: WebGLShader,
  glFragmentShader: WebGLShader
): void {
  function parseForErrors(shader: WebGLShader, name: string): void {
    let message = '';
    const errors = gl.getShaderInfoLog(shader);
    if (errors) {
      message += `Errors in ${name}:\n\n${errors}`;
    }
    const source = gl.getShaderSource(shader);
    if (source) {
      message += source
        .replaceAll('\t', '  ')
        .split('\n')
        .reduce(
          (previousValue: string, currentValue: string, currentIndex: number): string =>
            `${previousValue}\n${currentIndex + 1}:\t\t${currentValue}`,
          `\n`
        );
    }
    if (message) {
      console.error(message);
    }
  }

  parseForErrors(glVertexShader, 'Vertex Shader');
  parseForErrors(glFragmentShader, 'Fragment Shader');
}
