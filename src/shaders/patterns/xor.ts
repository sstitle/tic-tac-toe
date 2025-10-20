export interface XorParams {
  scale?: number
  animate?: boolean
}

export function xorPattern(params: XorParams = {}) {
  const { scale = 10.0, animate = false } = params

  const code = `
    vec3 xorPattern(vec2 uv, float time) {
      vec2 pos = uv * ${scale.toFixed(2)};
      ${animate ? `
        pos += time * 0.5;
      ` : ''}
      int x = int(pos.x * 256.0);
      int y = int(pos.y * 256.0);
      int xorValue = x ^ y;
      float value = float(xorValue % 256) / 255.0;
      return vec3(value);
    }
  `

  return {
    code,
    uniforms: {}
  }
}
