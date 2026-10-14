import Svg, { Path } from "react-native-svg";
import { oklch } from "../../style/identity-text.js";
import type { AvatarProps } from "./avatar.shared.js";

export function referenceSizeOf(p: AvatarProps) {
  if (p.logo) return "logo";
  if (p.annotation) return "annotation";
  if (p.compact) return "compact";
  if (p.account) return "account";
  if (p.row) return "row";
  if (p.person) return "person";
  if (p.profile) return "profile";
  if (p.detail) return "detail";
  if (p.hero) return "hero";
  if (p.featured) return "featured";
  if (p.spotlight) return "spotlight";
  return null;
}
export function referencePaintOf(p: Pick<AvatarProps, "logo" | "orchid">) {
  if (p.logo) return "logo";
  if (p.orchid) return "orchid";
  return "identity";
}
export function sheenOf(p: AvatarProps) {
  if (p.strongSheen) return 3;
  if (p.mediumSheen) return 2.5;
  if (p.sheen) return 2;
  return 0;
}
export const REFERENCE_SIZES = {
  logo: 30,
  annotation: 16, compact: 30, account: 32, row: 36, person: 38,
  profile: 44, detail: 52, hero: 58, featured: 60, spotlight: 74,
};
export const REFERENCE_TYPE = {
  logo: { fontSize: 14, lineHeight: 14, fontWeight: "800" as const },
  annotation: { fontSize: 9, lineHeight: 9 }, compact: { fontSize: 12, lineHeight: 12 },
  account: { fontSize: 13, lineHeight: 13 }, row: { fontSize: 13, lineHeight: 13 },
  person: { fontSize: 12, lineHeight: 12 }, profile: { fontSize: 15, lineHeight: 15 },
  detail: { fontSize: 17, lineHeight: 17 }, hero: { fontSize: 19, lineHeight: 19 },
  featured: { fontSize: 26, lineHeight: 26 }, spotlight: { fontSize: 32, lineHeight: 32 },
};

function mixHex(from: string, to: string, t: number): string {
  return "#" + [1, 3, 5].map((at) => {
    const a = parseInt(from.slice(at, at + 2), 16), b = parseInt(to.slice(at, at + 2), 16);
    return Math.round(a + (b - a) * t).toString(16).padStart(2, "0");
  }).join("");
}
/** The reference's 48 arc segments, including its 0.6-degree seam overlap. */
export function ConicRing({ size, width, hue }: { size: number; width: number; hue: number }) {
  const stops = [oklch(0.72, 0.15, hue), oklch(0.88, 0.05, hue + 70), oklch(0.72, 0.15, hue)];
  const radius = size / 2 - width / 2, center = size / 2;
  return <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
    {Array.from({ length: 48 }, (_, i) => {
      const t = i / 48, end = (i + 1) / 48;
      const a = ((210 + t * 360 - 90) * Math.PI) / 180;
      const b = ((210 + end * 360 - 90 + 0.6) * Math.PI) / 180;
      const pos = ((t + end) / 2) * 2, index = Math.min(Math.floor(pos), 1);
      return <Path key={i} d={`M ${center + radius * Math.cos(a)} ${center + radius * Math.sin(a)} A ${radius} ${radius} 0 0 1 ${center + radius * Math.cos(b)} ${center + radius * Math.sin(b)}`} stroke={mixHex(stops[index]!, stops[index + 1]!, pos - index)} strokeWidth={width} fill="none" />;
    })}
  </Svg>;
}
