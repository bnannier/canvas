/**
 * What makes a corner right on its platform: the rule test/design-rules-shape.test.ts holds
 * every corner in the kit to.
 *
 * A corner is right only when it is one of these, decided where its number is written:
 *
 * - **A role of its own platform's row, for the role its element plays.** A read of
 *   `shape.<platform>.<role>` (the roles every platform draws, src/style/tokens.ts) or of
 *   `platformShape.<platform>.<role>` (the rest of that platform's row, the roles only it or
 *   only the kit draws, src/style/platform-shape.ts), on the platform the skin draws, by a
 *   component that plays that role (COMPONENT_ROLES in tools/tokens/shape-roles.ts). A number
 *   that merely equals a role's value says nothing about the role, so a bare number is
 *   refused even then; so is another platform's row (a native skin that draws Dark
 *   Factory's look for a part shares the web skin's part instead).
 * - **The pill.** 9999, which every renderer clamps to half the shorter side: every capsule
 *   and circle, written as itself rather than as half of a size.
 * - **Square.** 0.
 * - **Concentric.** A corner computed from a real container's corner less its real inset
 *   (or, for a container wrapped around capsules, a capsule's half-height plus the inset),
 *   declared with that construction in tools/tokens/shape-roles.ts (CONCENTRIC_CORNERS),
 *   where the shape test computes it from the container's own skin.
 *
 * A clamp of one of these to its element's measured size (`Math.min(skin.barRadius, w / 4)`)
 * is judged as the corner it clamps, as a renderer bounds 9999 by the element's size. A
 * step of the public `radius` ladder that the app picks through a public prop (Image's and
 * Video's `radius`) is the call site's corner, not the kit's, and is not judged here.
 *
 * The platform a corner is drawn on is the skin that draws it (tools/tokens/corner-sites.ts,
 * `CornerValue.drawn`): its file (`.ios.tsx`) or the names it is set under (`iosSkin`,
 * `IOS_RADIUS`, `M3_TRACK_R`, `androidBase`), and for a constant, helper or component no
 * platform names, in whatever module, every place that uses it. Code every platform shares
 * (a shell's own code, a part only shared code uses) draws the web look on every platform.
 */

import { dirname, relative } from "node:path";
import type { PlatformKey } from "../../src/style/tokens.ts";
import type { CornerValue, DrawnPlace } from "./corner-sites.ts";
import { COMPONENT_ROLES } from "./shape-roles.ts";

const PILL = 9999;

/**
 * The part a place draws, the same on every platform: its file without a platform suffix
 * and its path without the platform's name (`x.styles.ts Skin.actionButton` for both
 * `webSkin.actionButton` and `iosSkin.actionButton`).
 */
export function partOf(place: Pick<DrawnPlace, "file" | "path">): string {
  const file = place.file.replace(/\.(?:ios|android|web)(\.tsx?)$/, "$1");
  const path = place.path
    .split(".")
    .map((name) => name.replace(/^(?:web|ios|android|m3)(?=[A-Z_]|$)/i, ""))
    .join(".");
  return `${file} ${path}`;
}

/** Where a corner is written, as CONCENTRIC_CORNERS names a site: its file and its path. */
export const siteOf = (v: Pick<CornerValue, "file" | "path">): string => `${v.file} ${v.path}`;

/** The component a corner is written in: its directory under src/ (`atoms/kbd`, `style`). */
export const componentOf = (file: string): string => relative("src", dirname(file));

export interface CornerContext {
  /** The sites (`siteOf`) that CONCENTRIC_CORNERS declares with their containers. */
  concentric?: ReadonlySet<string>;
  /** The roles each component plays; COMPONENT_ROLES unless a test gives its own. */
  roles?: Readonly<Record<string, readonly string[]>>;
}

/** How a corner is right on every platform that draws it, or why it is not, naming the skin that draws it. */
export function cornerVerdict(v: CornerValue, context: CornerContext = {}): { ok: true; form: string } | { ok: false; reason: string } {
  const { concentric = new Set<string>(), roles = COMPONENT_ROLES } = context;
  const written = `${v.file}:${v.line} ${v.path || "(top level)"} (${v.text})`;
  const skin = (place: DrawnPlace) => `${place.file}:${place.line} ${place.path || "(top level)"}`;
  const rowOf = (place: DrawnPlace) => (place.platform ? `${place.platform}'s row` : "the web row (shared code draws the web look)");
  if (v.kind === "consumer") return { ok: true, form: "the app's own pick, through a public prop" };
  if (v.drawn.length === 0) return { ok: false, reason: `${written} draws no corner anywhere the scan can see` };
  const read = v.read;
  if (read?.table === "shape" || read?.table === "platformShape") {
    const table = `${read.table}.${read.platform}.${read.key}`;
    for (const place of v.drawn) {
      const draws: PlatformKey = place.platform ?? "web";
      if (read.platform === draws) continue;
      const shared = read.platform === "web" && place.platform !== null && v.drawn.some((w) => w.platform === "web" && partOf(w) === partOf(place));
      if (shared) continue;
      const how = read.platform === "web" && place.platform ? ", or is the web skin's own part (the web skin's same part draws this number; none does)" : "";
      return {
        ok: false,
        reason: `${skin(place)} draws ${table} (${written}), another platform's row: it draws ${draws}, so it reads ${rowOf(place)}${how}`,
      };
    }
    const component = componentOf(v.file);
    if (!(roles[component] ?? []).includes(read.key)) {
      return { ok: false, reason: `${written} reads the ${read.key} role, which ${component} does not play (COMPONENT_ROLES in tools/tokens/shape-roles.ts)` };
    }
    const on = [...new Set(v.drawn.map((place) => place.platform ?? "shared code"))].join(", ");
    return { ok: true, form: `the ${read.key} role of ${read.platform}'s row, drawn on ${on}` };
  }
  const place = v.drawn[0];
  if (read?.table === "radius") {
    return { ok: false, reason: `${skin(place)} draws the radius ladder (radius.${read.key ?? "*"}, ${v.value}, ${written}), which names no role: read the role it plays from ${rowOf(place)}` };
  }
  if (v.value === 0) return { ok: true, form: "square" };
  if (v.value === PILL) return { ok: true, form: "the pill" };
  if (v.concentric) {
    if (concentric.has(siteOf(v))) return { ok: true, form: `concentric, ${v.concentric}` };
    return { ok: false, reason: `${written} writes ${v.value} ${v.concentric}, but CONCENTRIC_CORNERS declares no container for it` };
  }
  return {
    ok: false,
    reason: `${skin(place)} draws ${v.value} (${written}), which is no role of ${rowOf(place)}: read the role its element plays, or write the pill (9999), square (0) or a declared concentric corner`,
  };
}
