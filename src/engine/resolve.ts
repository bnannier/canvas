// The core engine: resolve a Tailwind className string to a React Native style
// object for a given context. Pure and RN-free so it is unit-testable headless.
//
// Variants are desktop-first: unprefixed utilities are the base (desktop), and
// breakpoint-prefixed utilities (sm/md/lg/xl/2xl) apply at that width AND BELOW,
// with the smallest matching breakpoint winning. dark: applies when the dark
// scheme is active; hover/active/focus/disabled apply per interaction state.

import {
  type ColorTokens,
  baseColors,
  palette,
  spacing,
  radius,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  breakpoints,
} from "./tokens.js";

export type RNStyle = Record<string, string | number>;

export interface InteractionState {
  hover?: boolean;
  active?: boolean;
  focus?: boolean;
  disabled?: boolean;
}

export interface ResolveContext {
  /** Active scheme's color tokens (light or dark set). */
  tokens: ColorTokens;
  /** Current viewport width in px, for desktop-first responsive variants. */
  width: number;
  /** Whether the dark scheme is active, for the dark: variant. */
  dark: boolean;
  /** Current interaction state, for hover/active/focus/disabled variants. */
  state?: InteractionState;
}

// Smaller breakpoints rank higher so they win on narrow screens (desktop-first).
const BP_RANK: Record<string, number> = { "2xl": 0, xl: 1, lg: 2, md: 3, sm: 4 };
const STATE_PREFIXES = new Set(["hover", "active", "focus", "disabled"]);

/** Resolve a className string to an RN style object for the given context. */
export function resolve(className: string, ctx: ResolveContext): RNStyle {
  const utils = className.split(/\s+/).filter(Boolean);
  const active: { base: string; priority: number; index: number }[] = [];

  utils.forEach((util, index) => {
    const segs = util.split(":");
    const base = segs.pop() as string;
    let priority = 0;
    let ok = true;
    for (const p of segs) {
      if (p in breakpoints) {
        if (ctx.width <= breakpoints[p]) priority += 100 + BP_RANK[p];
        else { ok = false; break; }
      } else if (p === "dark") {
        if (ctx.dark) priority += 1000;
        else { ok = false; break; }
      } else if (STATE_PREFIXES.has(p)) {
        if (ctx.state?.[p as keyof InteractionState]) priority += 10000;
        else { ok = false; break; }
      } else {
        ok = false; // unknown variant: skip the whole utility
        break;
      }
    }
    if (ok) active.push({ base, priority, index });
  });

  // Stable sort by ascending priority so higher-priority utilities apply last.
  active.sort((a, b) => a.priority - b.priority || a.index - b.index);

  const out: RNStyle = {};
  for (const { base } of active) {
    const patch = utilityToStyle(base, ctx.tokens);
    if (patch) Object.assign(out, patch);
  }
  return out;
}

// --- color + length helpers -------------------------------------------------

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Resolve a color token name (with optional /alpha) to a CSS color string. */
function color(name: string, tokens: ColorTokens): string | undefined {
  let key = name;
  let alpha: number | undefined;
  const slash = name.indexOf("/");
  if (slash !== -1) {
    key = name.slice(0, slash);
    const a = Number(name.slice(slash + 1));
    if (!Number.isNaN(a)) alpha = a / 100;
  }
  const hex = (tokens as unknown as Record<string, string>)[key] ?? baseColors[key] ?? palette[key];
  if (!hex) return undefined;
  // Only the #rrggbb form can take a /alpha suffix. Token values that are
  // already non-hex (e.g. the translucent rgba() glass surfaces) are returned
  // as-is, so the suffix is a no-op rather than feeding garbage to hexToRgba.
  if (alpha === undefined || hex === "transparent" || hex[0] !== "#") return hex;
  return hexToRgba(hex, alpha);
}

/** Resolve a length suffix (4, full, 1/2, px, auto, [12px]) to a value. */
function lengthValue(token: string): string | number | undefined {
  if (token === "full") return "100%";
  if (token === "auto") return "auto";
  if (token === "px") return 1;
  if (token in spacing) return spacing[token];
  const frac = token.match(/^(\d+)\/(\d+)$/);
  if (frac) return `${(Number(frac[1]) / Number(frac[2])) * 100}%`;
  const arb = token.match(/^\[(.+)\]$/);
  if (arb) {
    const v = arb[1];
    if (v.endsWith("px")) return Number(v.slice(0, -2));
    return v;
  }
  return undefined;
}

// --- prefixed family parsers ------------------------------------------------

function parseSpacing(util: string): RNStyle | null {
  const m = util.match(/^(-?)(px|py|pt|pr|pb|pl|p|mx|my|mt|mr|mb|ml|m|gap-x|gap-y|gap)-(.+)$/);
  if (!m) return null;
  let val = lengthValue(m[3]);
  if (val === undefined) return null;
  if (m[1] === "-" && typeof val === "number") val = -val;
  const map: Record<string, string[]> = {
    p: ["padding"], px: ["paddingHorizontal"], py: ["paddingVertical"],
    pt: ["paddingTop"], pr: ["paddingRight"], pb: ["paddingBottom"], pl: ["paddingLeft"],
    m: ["margin"], mx: ["marginHorizontal"], my: ["marginVertical"],
    mt: ["marginTop"], mr: ["marginRight"], mb: ["marginBottom"], ml: ["marginLeft"],
    gap: ["gap"], "gap-x": ["columnGap"], "gap-y": ["rowGap"],
  };
  const props = map[m[2]];
  if (!props) return null;
  const out: RNStyle = {};
  for (const p of props) out[p] = val;
  return out;
}

function parseSizing(util: string): RNStyle | null {
  const m = util.match(/^(min-w|max-w|min-h|max-h|size|w|h)-(.+)$/);
  if (!m) return null;
  const val = lengthValue(m[2]);
  if (val === undefined) return null;
  switch (m[1]) {
    case "w": return { width: val };
    case "h": return { height: val };
    case "min-w": return { minWidth: val };
    case "max-w": return { maxWidth: val };
    case "min-h": return { minHeight: val };
    case "max-h": return { maxHeight: val };
    case "size": return { width: val, height: val };
  }
  return null;
}

function parseInset(util: string): RNStyle | null {
  const m = util.match(/^(-?)(inset-x|inset-y|inset|top|right|bottom|left)-(.+)$/);
  if (!m) return null;
  let val = lengthValue(m[3]);
  if (val === undefined) return null;
  if (m[1] === "-" && typeof val === "number") val = -val;
  switch (m[2]) {
    case "inset": return { top: val, right: val, bottom: val, left: val };
    case "inset-x": return { left: val, right: val };
    case "inset-y": return { top: val, bottom: val };
    case "top": return { top: val };
    case "right": return { right: val };
    case "bottom": return { bottom: val };
    case "left": return { left: val };
  }
  return null;
}

function parseBorder(util: string, tokens: ColorTokens): RNStyle | null {
  const rest = util.slice("border-".length);
  if (/^\d+$/.test(rest)) return { borderWidth: Number(rest) };
  switch (rest) {
    case "t": return { borderTopWidth: 1 };
    case "r": return { borderRightWidth: 1 };
    case "b": return { borderBottomWidth: 1 };
    case "l": return { borderLeftWidth: 1 };
    case "x": return { borderLeftWidth: 1, borderRightWidth: 1 };
    case "y": return { borderTopWidth: 1, borderBottomWidth: 1 };
  }
  const c = color(rest, tokens);
  return c ? { borderColor: c } : null;
}

function parseRounded(util: string): RNStyle | null {
  const rest = util.slice("rounded-".length);
  const corner = rest.match(/^(tl|tr|bl|br|t|b|l|r)-(.+)$/);
  const TL = "borderTopLeftRadius", TR = "borderTopRightRadius";
  const BL = "borderBottomLeftRadius", BR = "borderBottomRightRadius";
  if (corner) {
    const size = radius[corner[2]];
    if (size === undefined) return null;
    const out: RNStyle = {};
    const set = (keys: string[]) => keys.forEach((k) => { out[k] = size; });
    switch (corner[1]) {
      case "t": set([TL, TR]); break;
      case "b": set([BL, BR]); break;
      case "l": set([TL, BL]); break;
      case "r": set([TR, BR]); break;
      case "tl": set([TL]); break;
      case "tr": set([TR]); break;
      case "bl": set([BL]); break;
      case "br": set([BR]); break;
    }
    return out;
  }
  const size = radius[rest];
  return size !== undefined ? { borderRadius: size } : null;
}

const SHADOWS: Record<string, RNStyle> = {
  none: { shadowOpacity: 0, elevation: 0 },
  sm: { shadowColor: "#000000", shadowOffset_w: 0, shadowOffset_h: 1, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  DEFAULT: { shadowColor: "#000000", shadowOffset_w: 0, shadowOffset_h: 1, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  md: { shadowColor: "#000000", shadowOffset_w: 0, shadowOffset_h: 4, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  lg: { shadowColor: "#000000", shadowOffset_w: 0, shadowOffset_h: 10, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8 },
  xl: { shadowColor: "#000000", shadowOffset_w: 0, shadowOffset_h: 20, shadowOpacity: 0.1, shadowRadius: 25, elevation: 12 },
};

/** Map a single base utility to a partial RN style, or null if unknown. */
function utilityToStyle(util: string, tokens: ColorTokens): RNStyle | null {
  switch (util) {
    case "flex": return { display: "flex" };
    case "hidden": return { display: "none" };
    case "flex-row": return { flexDirection: "row" };
    case "flex-col": return { flexDirection: "column" };
    case "flex-row-reverse": return { flexDirection: "row-reverse" };
    case "flex-col-reverse": return { flexDirection: "column-reverse" };
    case "flex-wrap": return { flexWrap: "wrap" };
    case "flex-nowrap": return { flexWrap: "nowrap" };
    case "flex-wrap-reverse": return { flexWrap: "wrap-reverse" };
    case "flex-1": return { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };
    case "flex-auto": return { flexGrow: 1, flexShrink: 1, flexBasis: "auto" };
    case "flex-initial": return { flexGrow: 0, flexShrink: 1, flexBasis: "auto" };
    case "flex-none": return { flexGrow: 0, flexShrink: 0, flexBasis: "auto" };
    case "grow": return { flexGrow: 1 };
    case "grow-0": return { flexGrow: 0 };
    case "shrink": return { flexShrink: 1 };
    case "shrink-0": return { flexShrink: 0 };
    case "items-start": return { alignItems: "flex-start" };
    case "items-center": return { alignItems: "center" };
    case "items-end": return { alignItems: "flex-end" };
    case "items-stretch": return { alignItems: "stretch" };
    case "items-baseline": return { alignItems: "baseline" };
    case "justify-start": return { justifyContent: "flex-start" };
    case "justify-center": return { justifyContent: "center" };
    case "justify-end": return { justifyContent: "flex-end" };
    case "justify-between": return { justifyContent: "space-between" };
    case "justify-around": return { justifyContent: "space-around" };
    case "justify-evenly": return { justifyContent: "space-evenly" };
    case "self-auto": return { alignSelf: "auto" };
    case "self-start": return { alignSelf: "flex-start" };
    case "self-center": return { alignSelf: "center" };
    case "self-end": return { alignSelf: "flex-end" };
    case "self-stretch": return { alignSelf: "stretch" };
    case "absolute": return { position: "absolute" };
    case "relative": return { position: "relative" };
    case "italic": return { fontStyle: "italic" };
    case "not-italic": return { fontStyle: "normal" };
    case "uppercase": return { textTransform: "uppercase" };
    case "lowercase": return { textTransform: "lowercase" };
    case "capitalize": return { textTransform: "capitalize" };
    case "normal-case": return { textTransform: "none" };
    case "underline": return { textDecorationLine: "underline" };
    case "line-through": return { textDecorationLine: "line-through" };
    case "no-underline": return { textDecorationLine: "none" };
    case "text-left": return { textAlign: "left" };
    case "text-center": return { textAlign: "center" };
    case "text-right": return { textAlign: "right" };
    case "text-justify": return { textAlign: "justify" };
    case "border": return { borderWidth: 1 };
    case "rounded": return { borderRadius: radius.DEFAULT };
    case "overflow-hidden": return { overflow: "hidden" };
    case "overflow-visible": return { overflow: "visible" };
    case "overflow-scroll": return { overflow: "scroll" };
    case "shadow": return expandShadow(SHADOWS.DEFAULT);
  }

  const spc = parseSpacing(util); if (spc) return spc;
  const sz = parseSizing(util); if (sz) return sz;
  const ins = parseInset(util); if (ins) return ins;

  const z = util.match(/^z-(\d+)$/); if (z) return { zIndex: Number(z[1]) };
  const op = util.match(/^opacity-(\d+)$/); if (op) return { opacity: Number(op[1]) / 100 };

  if (util.startsWith("bg-")) {
    const c = color(util.slice(3), tokens);
    return c ? { backgroundColor: c } : null;
  }
  if (util.startsWith("text-")) {
    const rest = util.slice(5);
    if (rest in fontSize) return { fontSize: fontSize[rest].fontSize, lineHeight: fontSize[rest].lineHeight };
    const c = color(rest, tokens);
    return c ? { color: c } : null;
  }
  if (util.startsWith("font-")) {
    const w = fontWeight[util.slice(5)];
    return w ? { fontWeight: w } : null;
  }
  if (util.startsWith("leading-")) {
    const lh = lineHeight[util.slice(8)];
    return lh !== undefined ? { lineHeight: lh } : null;
  }
  if (util.startsWith("tracking-")) {
    const ls = letterSpacing[util.slice(9)];
    return ls !== undefined ? { letterSpacing: ls } : null;
  }
  if (util.startsWith("shadow-")) {
    const s = SHADOWS[util.slice(7)];
    return s ? expandShadow(s) : null;
  }
  if (util.startsWith("border-")) return parseBorder(util, tokens);
  if (util.startsWith("rounded-")) return parseRounded(util);

  return null;
}

/** Expand the compact shadow record into RN's shadowOffset object form. */
function expandShadow(s: RNStyle): RNStyle {
  const { shadowOffset_w, shadowOffset_h, ...rest } = s as Record<string, number>;
  const out: RNStyle = { ...rest };
  if (shadowOffset_w !== undefined || shadowOffset_h !== undefined) {
    (out as Record<string, unknown>).shadowOffset = { width: shadowOffset_w ?? 0, height: shadowOffset_h ?? 0 };
  }
  return out;
}
