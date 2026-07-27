import { type ColorTokens } from "../../style/tokens.js";

// Co-located Backdrop skins, one per platform. A backdrop carries no chrome, so
// unlike a control there is no shape or press feedback to vary. What varies is the
// FRAME BUDGET: a backdrop is decorative, and decorative work must never be the
// reason a scroll drops frames.
//
//   iOS / web: the full field. Desktop GPUs and Apple's tile-based GPUs carry it.
//   Android:   trimmed hard. The mid-range Adreno and Mali floor is the real
//              constraint, and the rule is to hold 60fps and lose detail rather
//              than keep detail and lose frames.
//
// This is where the old hardcoded `Platform.OS === "android" ? 26 : 42` particle
// counts went. Scenes no longer branch on platform; they declare a full-detail
// field and the active skin decides how much of it is drawn.

export type Density = "sparse" | "default" | "dense";
export type Prominence = "subtle" | "default" | "vivid";

export interface BackdropSkin {
  /** Fraction of each declared particle field actually drawn, per density. */
  detail: (density: Density) => number;
  /** Global alpha cap, per prominence and scheme. Light schemes stay fainter so
   *  a backdrop never competes with body text. */
  prominence: (p: Prominence, dark: boolean) => number;
  /** The opaque floor painted under every layer. The surface owns its own base
   *  rather than borrowing the app shell's, so a host can sit behind a shell that
   *  has gone transparent without the window showing through to nothing. */
  floor: (t: ColorTokens, dark: boolean) => string | null;
}

// A scene declares the RICHEST field it wants; density selects how much of it is
// drawn. So the fraction never exceeds 1: `dense` means "do not trim", not "invent
// bodies the scene never described".
const FULL: Record<Density, number> = { sparse: 0.55, default: 0.8, dense: 1 };
const TRIMMED: Record<Density, number> = { sparse: 0.3, default: 0.5, dense: 0.7 };

// Off-white cool floor for light schemes: the celestial chart's paper.
const LIGHT_FLOOR = "#fafaff";

// Tuned legibility-first: a backdrop sits under body text, so even `vivid` stops
// short of full strength. Light schemes stay markedly fainter because dark text on
// a pale field loses contrast far faster than light text on a deep one.
function prominenceOf(p: Prominence, dark: boolean): number {
  if (p === "vivid") return dark ? 0.82 : 0.55;
  if (p === "subtle") return dark ? 0.38 : 0.22;
  return dark ? 0.62 : 0.38;
}

function floorOf(t: ColorTokens, dark: boolean): string | null {
  // Dark rides the deep background token (that colour IS the night sky); light
  // gets a cool off-white paper. Either way the floor is opaque.
  return dark ? t.background : LIGHT_FLOOR;
}

export const webSkin: BackdropSkin = {
  detail: (d) => FULL[d],
  prominence: prominenceOf,
  floor: floorOf,
};

export const iosSkin: BackdropSkin = {
  detail: (d) => FULL[d],
  prominence: prominenceOf,
  floor: floorOf,
};

export const androidSkin: BackdropSkin = {
  detail: (d) => TRIMMED[d],
  prominence: prominenceOf,
  floor: floorOf,
};
