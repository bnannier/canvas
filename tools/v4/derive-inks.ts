// Solves the text inks the v4 hand-off authors below their legibility floor and writes them
// into src/style/solved-inks.ts, so the token table reads literals and no bundle carries the
// solver (the JavaScript size gate's Button budget, and nothing walks oklch at startup).
//
//   bun run tokens:inks            write src/style/solved-inks.ts
//   bun run tokens:inks:check      fail when the committed file is not what this writes
//
// Which inks and why (src/style/tokens.ts, its note on roles that are not the hand-off's
// literal value): `destructive-text`, `success-text` and `warning-text` per scheme from the
// hand-off's status colours, `primary-text` (and `info`) per palette from its accent text,
// and `inverse-primary` per palette from the other scheme's accent text. Each is walked in
// oklch lightness at its own hue by ./ink-floor.ts until it reads at its floor on every bed
// it is drawn on; a hand-off value that already clears its beds is written unchanged.
// test/solved-inks.test.ts runs the check, so a token change that moves an ink fails until
// this is rerun.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { alpha, oklchHex } from "../../src/style/color.ts";
import { ACCENT, NEUTRALS, PALETTES, SERIES, glassByScheme, paletteHue, type ColorScheme, type InkRole, type Palette } from "../../src/style/tokens.ts";
import { solveHexInk, solveInk, type InkBed, type InkFloor } from "./ink-floor.ts";
import { HUE_TONE_WASH } from "../../src/style/hue-tone.ts";

const OUT = join(import.meta.dir, "../../src/style/solved-inks.ts");

/** The way a scheme's inks walk to clear a floor: away from its light page, or from its dark one. */
const TOWARD: Record<ColorScheme, "dark" | "light"> = { light: "dark", dark: "light" };

/**
 * The group opacity of iOS's pressed capsules and rows (the Dialog and AlertDialog capsules,
 * the Dropdown and ActionSheet rows): a red label on its gray capsule is read dimmed with it.
 * test/text-contrast.test.tsx renders the skins' actual pressed states against the solved ink.
 */
const IOS_PRESSED_DIM = 0.8;
/** iOS's translucent system fill under an ActionSheet row (the foreground at 10%), read dimmed when pressed. */
const IOS_SYSTEM_FILL = 0.1;

type Neutrals = (typeof NEUTRALS)[ColorScheme];

/** The opaque neutral surfaces a scheme draws text on. */
function surfacesOf(n: Neutrals): string[] {
  return [n.background, n["surface-sunken"]!, n.card, n.popover, n.muted, n.secondary, n["field-fill"]!];
}

/**
 * The status inks a scheme reads on its surfaces and its tone's own wash, solved from the
 * hand-off's status colours: the error ink also on iOS's pressed gray capsule.
 */
function solveStatusInks(scheme: ColorScheme): Record<InkRole, string> {
  const n = NEUTRALS[scheme];
  const surfaces = surfacesOf(n);
  const beds = (wash: string): InkBed[] => [
    ...surfaces.map((under) => ({ under })),
    ...surfaces.map((under) => ({ under, layers: [wash] })),
  ];
  return {
    "destructive-text": solveHexInk(n.destructive, [
      ...beds(n["destructive-soft"]!),
      { under: n.popover, layers: [n.secondary], dim: IOS_PRESSED_DIM },
      { under: n.popover, layers: [alpha(n.foreground, IOS_SYSTEM_FILL)], dim: IOS_PRESSED_DIM },
    ], TOWARD[scheme]),
    "success-text": solveHexInk(n.success, beds(n["success-soft"]!), TOWARD[scheme]),
    "warning-text": solveHexInk(n.warning, beds(n["warning-soft"]!), TOWARD[scheme]),
  };
}

/** Brand text's floor: 4.65:1 exact, so the anchor's 0.9 hover and channel rounding still clear 4.5. */
const PRIMARY_TEXT_FLOOR: InkFloor = { exact: 4.65, rounded: 4.5 };

/** The tonal selected fill's alpha (Material 3's secondary container over a track, the Android pill tab). */
const TONAL_SELECTED = 0.12;
/** The calendar's range band alpha, and today's own tint on top of it. */
const RANGE_BAND = 0.15;
const TODAY_TINT = 0.12;
/** The anchor's hover opacity (styles/tokens/base.css `a:hover`). */
const LINK_HOVER = 0.9;

/**
 * Every bed brand text is read on in a scheme: the neutral surfaces resting and under the
 * anchor's hover, the tonal selection and the accent's soft wash over each, and today's
 * label inside a calendar range on a card.
 */
function primaryTextBeds(n: Neutrals, ion: string, soft: string): InkBed[] {
  const surfaces = surfacesOf(n);
  return [
    ...surfaces.map((under) => ({ under })),
    ...surfaces.map((under) => ({ under, textOpacity: LINK_HOVER })),
    ...surfaces.map((under) => ({ under, layers: [alpha(ion, TONAL_SELECTED)] })),
    ...surfaces.map((under) => ({ under, layers: [soft] })),
    { under: n.card, layers: [alpha(ion, RANGE_BAND), alpha(ion, TODAY_TINT)] },
  ];
}

/**
 * The dense glass alpha a scheme paints the inverse pill at. The web frost's dense tint
 * (glass-surface/web-frost.ts) is the native one's density; test/text-contrast.test.tsx reads
 * the pill under every platform's own tint, so a web density that drifts from it fails there.
 */
function denseAlpha(scheme: ColorScheme): number {
  return Number(/,\s*([\d.]+)\s*\)$/.exec(glassByScheme[scheme]["glass-tint-dense"])?.[1] ?? 1);
}

/** The inverse pill's action ripple alpha (the Android snackbar's pressed state layer). */
const INVERSE_RIPPLE = 0.12;

/**
 * Every bed the inverse pill's action is read on: the pill solid, and under glass at each
 * dense alpha over the page and a card, each resting and under its pressed ripple.
 */
function inversePrimaryBeds(scheme: ColorScheme): InkBed[] {
  const n = NEUTRALS[scheme];
  const ripple = alpha(n["inverse-foreground"]!, INVERSE_RIPPLE);
  const pills: InkBed[] = [
    { under: n.inverse! },
    ...[n.background, n.card].map((under) => ({ under, layers: [alpha(n.inverse!, denseAlpha(scheme))] })),
  ];
  return pills.flatMap((pill) => [pill, { ...pill, layers: [...(pill.layers ?? []), ripple] }]);
}

/**
 * The fixed series hues a text tone names (Typography and Badge `cyan` and `mint`): the
 * hand-off's palette-independent `--cyan` and `--mint`, its series 2 and 3, by their place
 * in SERIES.
 */
export const HUE_TONES = { cyan: 0, mint: 1 } as const;
export type HueTone = keyof typeof HUE_TONES;


/**
 * Every bed a hue tone's ink is read on in a scheme: the neutral surfaces, bare and under
 * the tone's own 16% wash (a Badge's pill).
 */
function hueToneBeds(n: Neutrals, hue: string): InkBed[] {
  const surfaces = surfacesOf(n);
  return [...surfaces.map((under) => ({ under })), ...surfaces.map((under) => ({ under, layers: [alpha(hue, HUE_TONE_WASH)] }))];
}

export interface SchemeInks {
  status: Record<InkRole, string>;
  "primary-text": Record<Palette, string>;
  "inverse-primary": Record<Palette, string>;
  hues: Record<HueTone, string>;
}

/** Every solved ink, per scheme and palette. */
export function solveInks(): Record<ColorScheme, SchemeInks> {
  const scheme = (s: ColorScheme): SchemeInks => {
    const a = ACCENT[s];
    const other = ACCENT[s === "dark" ? "light" : "dark"];
    const perPalette = (solve: (hue: number) => string) => Object.fromEntries(PALETTES.map((p) => [p, solve(paletteHue[p])])) as Record<Palette, string>;
    return {
      status: solveStatusInks(s),
      "primary-text": perPalette((hue) => {
        const ion = oklchHex(a.fill[0], a.fill[1], hue);
        return solveInk([a.text[0], a.text[1], hue], primaryTextBeds(NEUTRALS[s], ion, alpha(ion, a.soft)), TOWARD[s], PRIMARY_TEXT_FLOOR);
      }),
      "inverse-primary": perPalette((hue) => solveInk([other.text[0], other.text[1], hue], inversePrimaryBeds(s), TOWARD[s === "dark" ? "light" : "dark"])),
      // A hue tone's ink starts from the series colour itself and walks only as far as its
      // beds need: the dark scheme's light series already clears them.
      hues: Object.fromEntries((Object.keys(HUE_TONES) as HueTone[]).map((tone) => {
        const [L, C, H] = SERIES[s][HUE_TONES[tone]]!;
        return [tone, solveInk([L, C, H], hueToneBeds(NEUTRALS[s], oklchHex(L, C, H)), TOWARD[s])];
      })) as Record<HueTone, string>,
    };
  };
  return { light: scheme("light"), dark: scheme("dark") };
}

/** The generated module's text. */
export function renderInks(): string {
  const inks = solveInks();
  const record = (r: Record<string, string>, indent: string) =>
    `{\n${Object.entries(r).map(([k, v]) => `${indent}  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n")}\n${indent}}`;
  const scheme = (s: ColorScheme) => {
    const i = inks[s];
    return `  ${s}: {\n    status: ${record(i.status, "    ")},\n    "primary-text": ${record(i["primary-text"], "    ")},\n    "inverse-primary": ${record(i["inverse-primary"], "    ")},\n    hues: ${record(i.hues, "    ")},\n  },`;
  };
  return [
    "// GENERATED by tools/v4/derive-inks.ts (`bun run tokens:inks`); do not edit by hand.",
    "// The v4 text inks solved to their legibility floor, read by ./tokens.ts as literals so no",
    "// bundle carries the solver. test/solved-inks.test.ts fails when this is stale.",
    "",
    "/** The solved text inks, per scheme: the status inks, the brand inks per palette, and the hue tones' inks. */",
    "export const SOLVED_INKS = {",
    scheme("light"),
    scheme("dark"),
    "} as const;",
    "",
  ].join("\n");
}

if (import.meta.main) {
  const text = renderInks();
  if (process.argv.includes("--check")) {
    if (readFileSync(OUT, "utf-8") !== text) {
      console.error("src/style/solved-inks.ts is stale: run `bun run tokens:inks`.");
      process.exit(1);
    }
    console.log("tokens:inks --check: src/style/solved-inks.ts matches the solver.");
  } else {
    writeFileSync(OUT, text);
    console.log(`wrote ${OUT}`);
  }
}
