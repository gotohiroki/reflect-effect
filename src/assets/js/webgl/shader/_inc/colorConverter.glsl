vec3 sRgb2Linear(vec3 color) {
  vec3 sRGB = color.rgb;
  color.rgb = sRGB * (sRGB * (sRGB * 0.305306011 + 0.682171111) + 0.012522878);
  return color;
}

vec3 linear2sRgb(vec3 color) {
  vec3 linearColor = color.rgb;
  vec3 S1 = sqrt(linearColor);
  vec3 S2 = sqrt(S1);
  vec3 S3 = sqrt(S2);
  color.rgb = 0.662002687 * S1 + 0.684122060 * S2 - 0.323583601 * S3 - 0.0225411470 * linearColor;
  return color;
}