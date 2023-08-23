// Constants

export const SCALE_MULTIPLIER = 1.0e8; // 1 unit = 1/SCALE_MULTIPLIER pc (Parsec)

export const RENDER_DISTANCE = SCALE_MULTIPLIER * 1000.0; // Filter radius for rendered stars (Parsec)
export const RENDER_DISTANCE_MAX = SCALE_MULTIPLIER * 10000.0; // Distance that will load all stars (Parsec)
export const RENDER_DISTANCE_3D = SCALE_MULTIPLIER * 2.5;

export const MODEL_SCALE = SCALE_MULTIPLIER * 2 * 2.25461e-8; // Diameter based on nominal solar radius (Parsec)
export const PARTICLE_SIZE = MODEL_SCALE * 10.0; // Distant sun diameter (Parsec)
export const PARTICLE_ALPHA = 0.7;

export const CAMERA_FOV = 45;
export const CAMERA_NEAR = 1.0;
export const CAMERA_FAR = SCALE_MULTIPLIER * 5000.0;

export const CONTROLS_MOVEMENT_SPEED_DEFAULT = SCALE_MULTIPLIER * 0.000001;
export const CONTROLS_MOVEMENT_SPEED_WARP = SCALE_MULTIPLIER * 0.0001;
export const CONTROLS_ROLLSPEED = 0.5;

export const BLOOM_INTENSITY = 1.0;
export const BLOOM_LUMINANCE_SMOOTHING = 0.05;
export const BLOOM_LUMINANCE_THRESHOLD = 0.01;

export const FOG_COLOR = 0x000000;
export const FOG_NEAR = SCALE_MULTIPLIER * 10.0;
export const FOG_FAR = SCALE_MULTIPLIER * 350.0;

export const RAYS_DECAY = 0.85;
export const RAYS_WEIGHT = 0.25;
export const RAYS_SAMPLES = 60;

export const MOUSEOVER_COLOR = 0xffa0a0;
export const RAYCASTER_THRESHOLD = MODEL_SCALE;
export const TRAVEL_TIME = 3000;
export const TRAVEL_ROTATION_MULTIPLIER = 0.1;
