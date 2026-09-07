/**
 * The families where the web CSS hand-off and the React Native skins must agree.
 *
 * styles/tokens/platforms.css is a TRANSCRIPTION of the per-OS skins in
 * src/**\/*.styles.ts: the skins are the implementation, and the CSS exists so a web
 * surface and the design-system mirror can paint the same three looks. Nothing keeps a
 * transcription honest on its own, and it showed: an iOS Stats and EmptyState fragment
 * was pasted into the WEB block, where it silently overrode the web values declared a
 * few lines above (and set --p-min-target to 44px on a platform whose minimum is 0).
 * Both blocks resolved to plausible numbers, so nothing failed.
 *
 * This table is what test/design-rules-skins.test.ts compares, and it is meant to grow.
 * It covers the object-shaped skins first, since a skin whose value is a function of
 * (tokens, intent, size) has to be invoked with a plausible argument set before it can
 * be read, and a check that guesses at those arguments would fail for the wrong reason.
 * Adding a family here is the cheapest way to widen the guard.
 */

/** A skin value, already reduced to something comparable with a CSS declaration. */
export type SkinValue = number | string | null;

export interface FamilyCheck {
  /** The custom property, without the leading dashes. */
  token: string;
  /**
   * What to pull out of the skin object. Several skin fields are functions of the
   * active colour tokens (a surface needs `tokens.card` to fill with), so the reader
   * is handed a token set to call them with; the shapes and lengths it reads back do
   * not depend on which set. Return null when the skin declares nothing.
   */
  read: (skin: Record<string, unknown>, tokens: Record<string, string>) => SkinValue;
}

export interface SkinFamily {
  /** Display name for the test title. */
  name: string;
  /** Module path under src/, without the `.styles.ts` suffix. */
  module: string;
  checks: FamilyCheck[];
}

/** Read `key` off a nested object path, returning null rather than throwing. */
function at(skin: Record<string, unknown>, ...path: string[]): unknown {
  let node: unknown = skin;
  for (const key of path) {
    if (typeof node !== "object" || node === null) return null;
    node = (node as Record<string, unknown>)[key];
  }
  return node ?? null;
}

const num = (value: unknown): SkinValue => (typeof value === "number" ? value : null);

/** Call a skin field that is a function of the colour tokens, or return null. */
function styleOf(value: unknown, tokens: Record<string, string>, ...args: unknown[]): Record<string, unknown> | null {
  if (typeof value !== "function") return null;
  const result = (value as (...a: unknown[]) => unknown)(tokens, ...args);
  return typeof result === "object" && result !== null ? (result as Record<string, unknown>) : null;
}

/**
 * A skin's shadow, as the boxShadow string the web hand-off spells.
 *
 * The test harness aliases react-native to react-native-web, so `shadow()` resolves its
 * WEB branch for every skin, which is the branch the CSS transcribes. A skin that
 * declares no shadow at all reads as "none", the same as the CSS.
 */
function boxShadow(value: unknown): SkinValue {
  if (typeof value !== "object" || value === null) return "none";
  const shadow = (value as Record<string, unknown>).boxShadow;
  return typeof shadow === "string" ? shadow : "none";
}

/** Card's elevation is keyed by name rather than by tokens. */
function callElevation(value: unknown, level: string): unknown {
  return typeof value === "function" ? (value as (e: string) => unknown)(level) : null;
}

export const SKIN_FAMILIES: SkinFamily[] = [
  {
    // The family the misplaced fragment broke. Every one of these six resolved to the
    // iOS value on web until platforms.css was repaired.
    name: "Stats",
    module: "molecules/stats/stats",
    checks: [
      { token: "p-stat-radius", read: (s, t) => num(styleOf(s.cardSurface, t)?.borderRadius) },
      { token: "p-stat-pad", read: (s, t) => num(styleOf(s.cardSurface, t)?.padding) },
      { token: "p-stat-gap", read: (s) => num(at(s, "rowGap", "card", "gap")) },
      { token: "p-stat-shadow", read: (s, t) => boxShadow(styleOf(s.cardSurface, t)) },
      { token: "p-stat-value-lh", read: (s, t) => num(styleOf(s.valueText, t)?.lineHeight) },
      { token: "p-stat-value-tracking", read: (s, t) => num(styleOf(s.valueText, t)?.letterSpacing) ?? 0 },
      { token: "p-stat-label-tracking", read: (s, t) => num(styleOf(s.labelText, t)?.letterSpacing) ?? 0 },
    ],
  },
  {
    name: "EmptyState",
    module: "molecules/empty-state/empty-state",
    checks: [{ token: "p-empty-radius", read: (s) => num(at(s, "borderedBase", "borderRadius")) }],
  },
  {
    name: "Card",
    module: "molecules/card/card",
    checks: [
      { token: "p-card-radius", read: (s) => num(at(s, "radius")) },
      {
        token: "p-card-shadow",
        read: (s) => boxShadow(callElevation(s.elevation, "default")),
      },
      {
        token: "p-card-shadow-raised",
        read: (s) => boxShadow(callElevation(s.elevation, "raised")),
      },
    ],
  },
];

/**
 * Compare a skin value with a CSS declaration.
 *
 * Numbers arrive from the CSS as lengths ("12px"), and shadow strings differ only in
 * the spacing inside rgba(), which no browser cares about, so both sides are reduced
 * before the comparison rather than being compared as authored.
 */
export function normalize(value: SkinValue | string | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return String(value);
  const text = value.replace(/\/\*[\s\S]*?\*\//g, "").trim();
  const asLength = /^(-?[\d.]+)px$/.exec(text);
  if (asLength) return String(Number(asLength[1]));
  if (/^-?[\d.]+$/.test(text)) return String(Number(text));
  return text.replace(/\s+/g, "");
}
