import { type ViewStyle } from "react-native";
import { type ColorTokens, spacing } from "../../style/index.js";

// Co-located AppFrame and Page skins. App scaffolding is a "Shared" platform treatment
// like Row, Column and Container: a safe-area frame, a banner slot and a scrolling page
// lay out identically on iOS, Android and react-native-web, and no platform ships a
// control for the job, so the three skins reference the same object on purpose. The
// file exists to match the kit's platform-skin recipe.
//
// The frame paints the theme's `background` role edge to edge (the safe-area bands
// included); the page's gutter is the layout scale's padLoose step (24), the gutter the
// kit's own app frames have used on every form factor.

export interface AppFrameSkin {
  /** The frame's fill: the theme's page background, behind the safe-area bands too. */
  frame(tokens: ColorTokens): ViewStyle;
  /** The page's gutter on all four sides of its scrolling content, in px. */
  gutter: number;
}

const shared: AppFrameSkin = {
  frame: (tokens) => ({ backgroundColor: tokens.background }),
  gutter: spacing["6"],
};

export const webSkin: AppFrameSkin = shared;
export const iosSkin: AppFrameSkin = webSkin;
export const androidSkin: AppFrameSkin = webSkin;

// The frame fills its parent (the app root) on both axes.
export const root: ViewStyle = { flex: 1, width: "100%" };
// The body takes the height the banner leaves; minHeight 0 lets a scroller inside it
// shrink below its content instead of pushing the frame past the window.
export const body: ViewStyle = { flex: 1, minHeight: 0 };
// The page's scroller fills the body it is given.
export const scroll: ViewStyle = { flex: 1 };
// The page's own overlay host is content-sized: it takes the content's height inside
// the scroller rather than growing (a growing host would also claim Android's window
// capture plane, which belongs to the app root's host).
export const contentHost: ViewStyle = { flexGrow: 0, flexShrink: 0, flexBasis: "auto" };
