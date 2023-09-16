import { Color4, Vector3 } from '@babylonjs/core';
import { DISTANCE_MULTIPLIER, ZOOM_MULTIPLIER } from '@renderer/defaults';

/**
 * Converts B-V index (-0.4 to +2.0) to a THREE.js color
 * @see https://stackoverflow.com/questions/21977786/star-b-v-color-index-to-apparent-rgb-color
 */
export function bvToColor(bv: number, alpha = 1.0): Color4 {
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
  return new Color4(r, g, b, alpha);
}

/**
 * Converts parsec (pc) to light years (ly).
 * @see https://en.wikipedia.org/wiki/Parsec
 * @param ly Parsec
 * @returns Lightyears
 */
export function pcToLy(pc: number): number {
  return pc * 3.26156;
}

/**
 * Converts light years (ly) to parsec (pc).
 * @see https://en.wikipedia.org/wiki/Light-year
 * @param ly Lightyears
 * @returns Parsec
 */
export function lyToPc(ly: number): number {
  return ly / 3.26156;
}

/**
 * Converts real positions to world positions.
 * @param x Parsec
 * @param y Parsec
 * @param z Parsec
 * @returns Position in world coordinates.
 */
export function realToWorld(x: number, y: number, z: number): Vector3 {
  return new Vector3(
    x * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER,
    y * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER,
    z * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER
  );
}
