import { Platform, type ViewStyle } from "react-native";
import { lightColors, type ColorTokens } from "./tokens.js";

// Elevation presets, as ready-to-spread RN ViewStyle objects. The web ladder is the v4
// hand-off's three shadows (`--sh-sm`, `--sh-md`, `--sh-lg`): a drop in the scheme's shade
// with a 1px hairline ring in the light scheme, and a lit 1px top edge over a black drop in
// the dark one. sm is the resting card and tile, md the raised card, menu and floating
// chrome, lg the overlay (dialog, sheet, popover). The legacy levels map onto the three:
// row, empty and DEFAULT rest at sm, xl is the overlay's lg.
//
// On native the levels keep the platform geometry they always had (iOS `shadow*` props,
// Android `elevation`), coloured by the scheme's shade. On react-native-web the `shadow*`
// props are deprecated in favor of the cross-platform `boxShadow` string, so the web
// branch emits boxShadow. Pass the active tokens to colour by the active scheme:
// `{ ...shadow("md", t) }`. Without them the light scheme stands in.

export type ShadowLevel = "none" | "row" | "empty" | "sm" | "DEFAULT" | "md" | "lg" | "xl";

type ShadeTokens = Pick<ColorTokens, "shade" | "shade-md" | "shade-lg" | "shade-ring" | "shade-inset">;

// The hand-off's geometry per step, [offsetY, blur, spread], and the shade role it drops in.
const LADDER = {
  sm: { drop: [1, 2, 0], shade: "shade" },
  md: { drop: [12, 32, -10], shade: "shade-md" },
  lg: { drop: [30, 80, -16], shade: "shade-lg" },
} as const satisfies Record<string, { drop: readonly [number, number, number]; shade: keyof ShadeTokens }>;

const STEP: Record<Exclude<ShadowLevel, "none">, keyof typeof LADDER> = {
  row: "sm",
  empty: "sm",
  sm: "sm",
  DEFAULT: "sm",
  md: "md",
  lg: "lg",
  xl: "lg",
};

const NATIVE_SHADOWS: Record<Exclude<ShadowLevel, "none">, ViewStyle> = {
  row: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  empty: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  sm: { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 1.5, elevation: 1 },
  DEFAULT: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  md: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  lg: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.14, shadowRadius: 20, elevation: 8 },
  xl: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 12 },
};

/** A shade role from the passed tokens, falling back along the ladder, then to the light scheme's. */
function role(tokens: Partial<ShadeTokens> | undefined, name: keyof ShadeTokens): string | undefined {
  const pick = (t: Partial<ShadeTokens>) =>
    t[name] ?? (name === "shade-lg" ? (t["shade-md"] ?? t.shade) : name === "shade-md" ? t.shade : undefined);
  return (tokens && pick(tokens)) ?? pick(lightColors);
}

/** An rgba() or hex colour as an opaque rgb(), for the native shadowColor (the level sets the opacity). */
function opaque(color: string): string {
  const functional = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/.exec(color);
  if (functional) return `rgb(${functional[1]}, ${functional[2]}, ${functional[3]})`;
  return color.length === 9 ? color.slice(0, 7) : color;
}

/**
 * The web boxShadow of a level: the lit top edge, the drop and the hairline ring, each in
 * its scheme role (a scheme without one carries it transparent, as styles/tokens/shadows.css
 * spells the same three layers).
 */
export function webShadow(level: Exclude<ShadowLevel, "none">, tokens?: Partial<ShadeTokens>): string {
  const step = LADDER[STEP[level]];
  const [y, blur, spread] = step.drop;
  const clear = "rgba(0, 0, 0, 0)";
  return [
    `inset 0px 1px 0px 0px ${role(tokens, "shade-inset") ?? clear}`,
    `0px ${y}px ${blur}px ${spread}px ${role(tokens, step.shade) ?? "rgba(0, 0, 0, 0.2)"}`,
    `0px 0px 0px 1px ${role(tokens, "shade-ring") ?? clear}`,
  ].join(", ");
}

/**
 * The elevation preset for a level (defaults to the standard `shadow`), coloured by the
 * scheme's shade roles when the active tokens are passed.
 */
export function shadow(level: ShadowLevel = "DEFAULT", tokens?: Partial<ShadeTokens>): ViewStyle {
  if (Platform.OS === "web") {
    if (level === "none") return { boxShadow: "none" };
    return { boxShadow: webShadow(level, tokens) };
  }
  if (level === "none") return { shadowOpacity: 0, elevation: 0 };
  const drop = role(tokens, LADDER[STEP[level]].shade) ?? "rgba(0, 0, 0, 0.2)";
  return { ...NATIVE_SHADOWS[level], shadowColor: level === "xl" ? "#000000" : opaque(drop) };
}

/**
 * A one-off drop shadow for components that need a shade off the preset scale. Returns
 * the platform-correct `shadow*` props (+ optional Android `elevation`) on native, and
 * the equivalent `boxShadow` string on web (so react-native-web does not warn). The
 * color must be a solid 6-digit hex; the opacity is applied to it.
 */
export function customShadow(opts: {
  color?: string;
  offsetY?: number;
  radius?: number;
  opacity?: number;
  elevation?: number;
}): ViewStyle {
  const { color = "#000000", offsetY = 1, radius = 2, opacity = 0.2, elevation } = opts;
  if (Platform.OS === "web") {
    return { boxShadow: `0px ${offsetY}px ${radius}px ${hexToRgba(color, opacity)}` };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    ...(elevation != null ? { elevation } : null),
  };
}

function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
