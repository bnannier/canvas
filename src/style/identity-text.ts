// Hue text uses the original Argus OKLCH conversion exactly.
function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function gamma(v: number): number {
  const c = clamp01(v);
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function channelHex(v: number): string {
  return Math.round(clamp01(v) * 255).toString(16).padStart(2, "0");
}

/** OKLCH (lightness 0..1, chroma, hue in degrees) to an sRGB hex string. */
export function oklch(l: number, c: number, h: number): string {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  const r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;
  return `#${channelHex(gamma(r))}${channelHex(gamma(g))}${channelHex(gamma(bl))}`;
}


export function identityTextInk(hue: number, dark: boolean): string {
  return dark ? oklch(0.82, 0.11, hue) : oklch(0.5, 0.14, hue);
}
