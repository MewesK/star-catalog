export const ZOOM_MULTIPLIER = 1.0e8; // 1 unit = 1/SCALE_MULTIPLIER pc (Parsec)
export const DISTANCE_MULTIPLIER = 1.0;
export const SIZE_MULTIPLIER = 1.0;

export const RENDER_DISTANCE = 1000.0 * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER; // Filter radius for rendered stars (Parsec)
export const RENDER_DISTANCE_MAX = 10000.0 * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER; // Distance that will load all stars (Parsec)
export const RENDER_DISTANCE_3D = 0.00005 * ZOOM_MULTIPLIER;

export const MODEL_SIZE = ZOOM_MULTIPLIER * SIZE_MULTIPLIER * 4.50922e-8; // Diameter based on 2 * nominal solar radius (Parsec)
export const MODEL_FOG_DENSITY = 50000 / ZOOM_MULTIPLIER;
export const MODEL_RAYS_DECAY = 0.85;
export const MODEL_RAYS_WEIGHT = 0.25;
export const MODEL_RAYS_SAMPLES = 60;

export const PARTICLE_SIZE = MODEL_SIZE * 5.0; // Distant sun diameter (Parsec)
export const PARTICLE_ALPHA = 0.7;
export const PARTICLE_MOUSEOVER_COLOR = 0xffa0a0;

export const CAMERA_FOV = 45;
export const CAMERA_NEAR = 0.01 * MODEL_SIZE;
export const CAMERA_FAR = 5000.0 * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER;

export const CONTROLS_MOVEMENT_SPEED_DEFAULT = 0.0000001 * ZOOM_MULTIPLIER;
export const CONTROLS_MOVEMENT_SPEED_WARP = 0.00001 * ZOOM_MULTIPLIER;
export const CONTROLS_ROLLSPEED = 0.5;

export const BLOOM_INTENSITY = 1.0;
export const BLOOM_LUMINANCE_SMOOTHING = 0.05;
export const BLOOM_LUMINANCE_THRESHOLD = 0.01;

export const FOG_COLOR = 0x000000;
export const FOG_NEAR = 10.0 * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER;
export const FOG_FAR = 350.0 * ZOOM_MULTIPLIER * DISTANCE_MULTIPLIER;

export const TRAVEL_TIME = 3000;
export const TRAVEL_ROTATION_MULTIPLIER = 0.1;

export const RAYCASTER_THRESHOLD = MODEL_SIZE;
