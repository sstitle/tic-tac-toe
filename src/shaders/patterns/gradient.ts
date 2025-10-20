export interface GradientParams {
  type?: 'linear' | 'radial' | 'angular'
  angle?: number // for linear gradient (in radians)
  center?: [number, number] // for radial gradient
}

export function gradientPattern(params: GradientParams = {}) {
  const { type = 'linear', angle = 0, center = [0.5, 0.5] } = params

  const code = `
    vec3 gradient(vec2 uv, float time) {
      ${type === 'linear' ? `
        // Linear gradient
        float angle = ${angle.toFixed(4)};
        vec2 dir = vec2(cos(angle), sin(angle));
        float t = dot(uv - 0.5, dir) + 0.5;
        t = clamp(t, 0.0, 1.0);
        return vec3(t);
      ` : type === 'radial' ? `
        // Radial gradient
        vec2 center = vec2(${center[0].toFixed(4)}, ${center[1].toFixed(4)});
        float dist = length(uv - center);
        dist = clamp(dist * 1.414, 0.0, 1.0); // Normalize to 0-1
        return vec3(dist);
      ` : `
        // Angular gradient
        vec2 center = vec2(${center[0].toFixed(4)}, ${center[1].toFixed(4)});
        vec2 dir = uv - center;
        float angle = atan(dir.y, dir.x);
        float t = (angle + 3.14159265359) / (2.0 * 3.14159265359);
        return vec3(t);
      `}
    }
  `

  return {
    code,
    uniforms: {}
  }
}
