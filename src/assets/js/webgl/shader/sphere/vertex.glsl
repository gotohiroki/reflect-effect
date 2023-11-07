uniform float uTime;
varying vec3 vNormal;
varying vec3 vEye;

#include '../_inc/noise.glsl';

vec3 displace(vec3 v) {
  vec3 result = v;
  float n = cnoise31(result * 1.0 + uTime * 0.3);
  result += normal * n * 0.05;
  return result;
}

#include '../_inc/recalcNormal.glsl';

void main() {
  vec3 pos = displace(position);
  vec3 correctedNormal = recalcNormal(pos);

  vNormal = normalize(normalMatrix * correctedNormal);
  vEye = normalize(modelViewMatrix * vec4( pos, 1.0 )).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}