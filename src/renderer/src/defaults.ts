// Constants

export const SCALE_MULTIPLIER = 100; // 1 unit = 1/SCALE_MULTIPLIER parsec (pc)

export const RENDER_DISTANCE = SCALE_MULTIPLIER * 500; // Filter radius for rendered stars (Parsec)
export const RENDER_DISTANCE_MAX = SCALE_MULTIPLIER * 10000; // Distance that will load all stars (Parsec)
export const RENDER_DISTANCE_3D = SCALE_MULTIPLIER * 2.5;

export const MODEL_SCALE = SCALE_MULTIPLIER * 0.008;
export const PARTICLE_SIZE = SCALE_MULTIPLIER * 0.05;
export const PARTICLE_ALPHA = 0.7;

export const CAMERA_FOV = 45;
export const CAMERA_NEAR = 1;
export const CAMERA_FAR = SCALE_MULTIPLIER * 5000;

export const CONTROLS_MOVEMENT_SPEED_DEFAULT = SCALE_MULTIPLIER * 0.01;
export const CONTROLS_MOVEMENT_SPEED_WARP = SCALE_MULTIPLIER * 5;
export const CONTROLS_ROLLSPEED = 0.5;

export const BLOOM_INTENSITY = 0.5;
export const BLOOM_LUMINANCE_SMOOTHING = 0.3;
export const BLOOM_LUMINANCE_THRESHOLD = 0.1;

export const FOG_COLOR = 0x000000;
export const FOG_NEAR = SCALE_MULTIPLIER * 5;
export const FOG_FAR = SCALE_MULTIPLIER * 100;

export const MOUSEOVER_COLOR = 0xffa0a0;
export const RAYCASTER_THRESHOLD = SCALE_MULTIPLIER * 0.01;
