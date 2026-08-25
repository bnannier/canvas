import { type ViewStyle } from "react-native";
import { type ColorTokens, spacing } from "../../style/index.js";

// Co-located DashboardGrid skins, one per platform. DashboardGrid is a "Shared" treatment:
// the whole component is LAYOUT (a wrapping 12-column row of measured cells) plus one edit-
// mode affordance, and flexbox renders identically on iOS, Android, and react-native-web, so
// iosSkin and androidSkin reference the exact same object as webSkin. The three-skin file
// structure exists to match the kit's platform-skin recipe; the columns are INTENTIONALLY
// identical, and the sharing is the point rather than an oversight (the layout.styles.ts and
// grid.styles.ts precedent).
//
// What per-OS character the board does carry comes from the parts it composes: the widget's
// own content brings its card surface, and the drag grip, ghost, and insertion indicator come
// from the platform's own DragDrop family (passed in by the per-OS entry file). Nothing here
// would gain from an iOS or Material 3 delta.
//
// The cells stay bare: a widget arrives with its own surface (a Card, a Chart, a Stats row),
// so a fill or a border here would double-frame it. The only paint is the customize-mode
// affordance, which exists precisely to say "this cell is now a draggable object".

export interface DashboardGridSkin {
  /** Space between cells on both axes, in px; the density axis tightens it. */
  gap: (compact: boolean) => number;
  /** The customize-mode cell affordance: a dashed ring around the widget's own surface. */
  editCell: (t: ColorTokens) => ViewStyle;
  /** The grip row above the widget content while unlocked. */
  gripRow: ViewStyle;
}

// The grip sits at the trailing edge of its own row rather than floating over the widget:
// an absolutely-placed grip would cover whatever the widget's own surface paints in that
// corner (a card header action, a chart legend), and edit mode is explicit enough to afford
// the extra row.
const GRIP_ROW: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "flex-end" };

// Web base skin: the shared layout scale (identical on every platform).
export const webSkin: DashboardGridSkin = {
  gap: (compact) => (compact ? spacing["2"] : spacing["4"]),
  editCell: (t) => ({
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: t.border,
    borderRadius: 12,
    backgroundColor: t.muted,
    padding: spacing["1.5"],
    gap: spacing["1"],
  }),
  gripRow: GRIP_ROW,
};

// iOS (HIG) and Material 3 skins reference the same object: this component is pure layout
// plus one edit affordance, so there is no native metric to diverge toward. Keeping them
// identical is intentional (see the file header).
export const iosSkin: DashboardGridSkin = webSkin;
export const androidSkin: DashboardGridSkin = webSkin;
