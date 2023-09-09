export const ZOOM_MULTIPLIER = 100.0; // 1 unit = 1/SCALE_MULTIPLIER pc (Parsec)
export const DISTANCE_MULTIPLIER = 1.0;
export const SIZE_MULTIPLIER = 1.0;

export const RENDER_DISTANCE = 1000.0 * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER; // Filter radius for rendered stars (Parsec)
export const RENDER_DISTANCE_MAX = 10000.0 * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER; // Distance that will load all stars (Parsec)
export const WATCH_DISTANCE = 0.7 * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER;

export const CAMERA_FOV = 0.6;
export const CAMERA_MAX_Z = RENDER_DISTANCE;
export const CAMERA_SENSIBILITY = 150.0;
export const CAMERA_SPEED_DEFAULT = 0.2 * ZOOM_MULTIPLIER;
export const CAMERA_SPEED_WARP = 50.0 * ZOOM_MULTIPLIER;

export const FOG_START = 10.0 * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER;
export const FOG_END = RENDER_DISTANCE / 2;

export const TRAVEL_TIME = 1.0; // Seconds
export const PARTICLE_ALPHA = 0.95;
