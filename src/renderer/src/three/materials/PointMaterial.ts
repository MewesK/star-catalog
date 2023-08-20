import * as THREE from 'three';

export default class PointMaterial extends THREE.ShaderMaterial {
  constructor(uniforms: { [uniform: string]: THREE.IUniform } | undefined) {
    super({
      uniforms,
      vertexShader: `
attribute float alpha;
attribute float size;
attribute vec3 customColor;

varying vec3 vColor;
varying float vAlpha;

void main() {
    vColor = customColor;
    vAlpha = alpha;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    gl_PointSize = size * ( 300.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
}`,
      fragmentShader: `
uniform vec3 color;
uniform sampler2D pointTexture;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying vec3 vColor;
varying float vAlpha;

void main() {
    gl_FragColor = vec4( vColor, vAlpha * clamp( ( gl_FragCoord.z - 0.97 ) * 10.0 , 0.0, 1.0 ) );
    gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );

    #ifdef USE_FOG
        #ifdef USE_LOGDEPTHBUF_EXT
            float depth = gl_FragDepthEXT / gl_FragCoord.w;
        #else
            float depth = gl_FragCoord.z / gl_FragCoord.w;
        #endif
        float fogFactor = smoothstep( fogNear, fogFar, depth );
        gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
    #endif
}`,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      fog: true
    });
  }
}
