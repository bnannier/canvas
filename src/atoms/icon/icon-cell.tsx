import type { ReactNode } from "react";
import { View, useTheme, type LayoutStyle, type ViewStyle } from "../../style/index.js";
import { useHover, washStyle, webHover } from "../../style/hover.js";
import { HOVER, useReducedMotion } from "../../style/motion.js";
import { platformShape } from "../../style/platform-shape.js";

// Icon's `cell`: the glyph centred in a square cell (the Foundations page's icon grid,
// `aspect-ratio:1;border-radius:10px;display:grid;place-items:center`, hovered
// `background:var(--ion-soft);color:var(--ion-tx)`). It lives apart from the glyph drawing
// (icon.shared.tsx) because the cell is a corner of the UI, which the shape rules hold to
// the table, where a glyph's `rx` rounds a stroke in its own 24-unit drawing and is not.
//
// No platform ships a control for a glyph gallery's tile, so the cell is the web look on
// every platform. Its hover is web only, as the kit's other hover feedback is, and fades on
// the wash's timing; the hand-off also grows the hovered cell to 1.12 on its spring curve,
// which the kit does not draw (no new motion without the tuning harness).

const WEB_CELL_HOVER = webHover(HOVER.wash);
/** The cell: the parent's width, held square, the glyph centred, at the 10 px corner. */
const WEB_CELL: ViewStyle = { width: "100%", aspectRatio: 1, borderRadius: platformShape.web.iconCell, alignItems: "center", justifyContent: "center" };

export interface IconCellProps {
  /** The glyph, given whether a pointer rests on the cell (it then takes the accent ink). */
  glyph: (hovered: boolean) => ReactNode;
  /** The cell's accessible name: announced as an image when set and not decorative. */
  accessibilityLabel?: string;
  decorative?: boolean;
  testID?: string;
  style?: LayoutStyle;
}

/** The glyph in its square cell, the cell's hover wash under it. */
export function IconCell({ glyph, accessibilityLabel, decorative, testID, style }: IconCellProps) {
  const { tokens } = useTheme();
  const { hovered, target } = useHover(WEB_CELL_HOVER != null);
  const reduced = useReducedMotion();
  const wash = WEB_CELL_HOVER ? washStyle(hovered, tokens["primary-soft"] ?? tokens.accent, WEB_CELL_HOVER, reduced) : null;
  const named = !decorative && accessibilityLabel != null;
  return (
    <View
      {...target}
      testID={testID}
      accessibilityRole={named ? "image" : undefined}
      accessibilityLabel={named ? accessibilityLabel : undefined}
      aria-label={named ? accessibilityLabel : undefined}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? "no-hide-descendants" : undefined}
      aria-hidden={decorative || undefined}
      style={[WEB_CELL, wash, style]}
    >
      {glyph(hovered)}
    </View>
  );
}
