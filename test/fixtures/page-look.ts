import { pageColor } from "../../docs/src/shell/page-look.ts";
import { colorsFor, type ColorScheme, type Palette } from "../../src/style/tokens.ts";

// The colours a surface floats over on the docs' page (docs/src/shell/page-look.ts): the v4
// hand-off's page is flat, the scheme's `background`, with no frosted shell over it, so a
// docs page's own text sits on that one colour. The legibility gates hold glass surfaces
// and the inks on them against it. A look is named by its scheme and accent palette; the
// page reads the look's own tokens, so the beds follow the docs exactly.

/** The docs page's opaque colours under a surface, in a look: where a docs page's own text sits. */
export function shellBeds(look: { scheme: ColorScheme; palette: Palette }): string[] {
  return [pageColor(colorsFor(look.palette, look.scheme))];
}
