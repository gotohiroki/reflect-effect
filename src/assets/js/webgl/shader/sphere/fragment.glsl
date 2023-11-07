#include '../_inc/fresnel.glsl';
#include '../_inc/colorConverter.glsl';

uniform sampler2D uTexture;
uniform vec2 uScreenCoord;
uniform float uRefractPower;
varying vec3 vNormal;
varying vec3 vEye;

void main() {
  vec2 uv = gl_FragCoord.xy / uScreenCoord.xy;

  float f = fresnel(vEye, vNormal);
  float refractPower = (1.0 - uRefractPower) * (1.0 - 0.6) + 0.6;
  f = smoothstep(0.1, refractPower, f);

  float r = texture2D(uTexture, uv - vNormal.xy * f * (0.1 + 0.1 * 1.0)).r;
  float g = texture2D(uTexture, uv - vNormal.xy * f * (0.1 + 0.1 * 1.5)).g;
  float b = texture2D(uTexture, uv - vNormal.xy * f * (0.1 + 0.1 * 2.0)).b;

  vec3 color = vec3(r, g, b);

  gl_FragColor = vec4(color, 1.0);
}