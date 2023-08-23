import * as THREE from 'three';

export default class AnimatedStarMaterial extends THREE.ShaderMaterial {
  constructor(uniforms: { [uniform: string]: THREE.IUniform } | undefined) {
    super({
      uniforms,
      vertexShader: /*glsl*/ `
uniform vec2 uvScale;
varying vec2 vUv;

void main() {
  vUv = uvScale * uv;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}`,
      fragmentShader: `
uniform vec3 customColor;
uniform float time;

uniform float fogDensity;
uniform vec3 fogColor;

uniform sampler2D texture1;
uniform sampler2D texture2;

varying vec2 vUv;

void main(void) {
  vec2 position = - 1.0 + 2.0 * vUv;

  // Noise
  vec4 noise = texture2D( texture1, vUv );
  vec2 T1 = vUv + vec2( 1.5, - 1.5 ) * time * 0.02;
  vec2 T2 = vUv + vec2( - 0.5, 2.0 ) * time * 0.01;

  T1.x += noise.x * 2.0;
  T1.y += noise.y * 2.0;
  T2.x -= noise.y * 0.2;
  T2.y += noise.z * 0.2;

  // Lava
  float p = texture2D( texture1, T1 * 2.0 ).a;

  vec4 texColor = texture2D( texture2, T2 * 2.0 );
  vec4 newColor = texColor * ( vec4( p, p, p, p ) * 2.0 ) + ( texColor * texColor - 0.1 );

  if( newColor.r > 1.0 ) { newColor.bg += clamp( newColor.r - 2.0, 0.0, 100.0 ); }
  if( newColor.g > 1.0 ) { newColor.rb += newColor.g - 1.0; }
  if( newColor.b > 1.0 ) { newColor.rg += newColor.b - 1.0; }

  // Colorize
  gl_FragColor = vec4( customColor * newColor.rgb, 1.0 );

  // Fog
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  const float LOG2 = 1.442695;
  float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
  fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );

  gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
}`
    });
  }
}
