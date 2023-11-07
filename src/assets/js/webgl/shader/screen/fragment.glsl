struct Texture {
  sampler2D data;
  vec2 uvScale;
};

uniform Texture uCurrent;
uniform Texture uNext;
uniform float uProgress;
varying vec2 vUv;

vec4 getTexture(Texture tex, float scale) {
  vec2 uv = (vUv - 0.5) * scale * tex.uvScale + 0.5;
  return texture2D(tex.data, uv);
}

void main() {
  vec4 current = getTexture(uCurrent, 1.0);
  vec4 next = getTexture(uNext, uProgress * (1.0 - 0.8) + 0.8);

  vec4 outGoing = mix(current, next, uProgress);

  gl_FragColor = outGoing;
}