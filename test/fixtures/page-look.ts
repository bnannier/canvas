import { composite } from "../../src/style/color.ts";
import { PAGE_LOOK, gradientLine, orbEllipse, type PageLookName } from "../../docs/src/shell/page-look.ts";

// The colours a surface floats over on the docs' page look (docs/src/shell/page-look.ts,
// Dark Factory's page): the gradient's three stops and each orb at its full opacity (its
// centre) over the two stops its centre lies between, at the three reference pages. The
// legibility gates hold glass surfaces and the inks on them against these, the page every
// docs screen shows, and against the shell's frost over them, where a page's own text
// sits. tools/darkfactory/derive-tokens.ts solves the muted ink against the same beds.

const SIZES = [
  [1440, 900],
  [768, 1024],
  [390, 844],
] as const;

/** The stops (0, 1, 2) orb `index`'s centre lies between, at the reference pages. */
function orbStops(index: number): number[] {
  const stops = new Set<number>();
  for (const [w, h] of SIZES) {
    const { cx, cy } = orbEllipse(PAGE_LOOK.orbs[index]!, w, h);
    const line = gradientLine(PAGE_LOOK.angle, w, h);
    const [dx, dy] = [line.x2 - line.x1, line.y2 - line.y1];
    const t = Math.min(1, Math.max(0, ((cx - line.x1) * dx + (cy - line.y1) * dy) / (dx * dx + dy * dy)));
    stops.add(Math.min(1, Math.floor(t * 2)));
    stops.add(Math.min(2, Math.floor(t * 2) + 1));
  }
  return [...stops];
}

const alpha = (hex: string, a: number) => `rgba(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")}, ${a})`;

/** The page look's opaque colours under a surface: the stops and the orb centres over them. */
export function pageLookBeds(name: PageLookName): string[] {
  const palette = PAGE_LOOK.palettes[name];
  const orbs = PAGE_LOOK.orbs.flatMap((orb, i) => orbStops(i).map((stop) => composite(alpha(palette.orbs[i]!, orb.opacity), palette.stops[stop]!)));
  return [...palette.stops, ...orbs];
}

/** The shell's frost over each of those: where a docs page's own text sits. */
export function shellBeds(name: PageLookName): string[] {
  return pageLookBeds(name).map((bed) => composite(PAGE_LOOK.palettes[name].shell, bed));
}
