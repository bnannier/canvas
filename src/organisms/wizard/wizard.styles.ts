import type { ViewStyle } from "react-native";

// Co-located Wizard skins, one per platform. Wizard draws no surface of its own: Dialog
// owns the fixed header/footer and the platform modal treatment, Steps and Button carry
// the platform controls, and the body consumes the same bounded workspace on every stage.
// What is left to the skin is the scrolled body's inset and the footer's spacing, which
// are the same on every OS; the platform entries inject the native parts.
export interface WizardSkin {
  /** The scrolled body's content inset. */
  bodyContent: ViewStyle;
  /** The fixed workflow step rail. */
  sidebar: ViewStyle;
  /** Back at the start, application actions at the end. */
  footer: ViewStyle;
}

// Layout-only and identical across platforms: the body fills the workspace Dialog bounds.
export const bodyScroll: ViewStyle = { flex: 1, minHeight: 0, minWidth: 0 };
export const actions: ViewStyle = { flexDirection: "row", gap: 8, marginStart: "auto" };
/** Below this panel width the step rail moves into the header as segmented bars, so the
 * body is never squeezed to its minimum beside a 170 px rail (a phone-width panel). */
export const RAIL_MINIMUM_PANEL = 520;

export const webSkin: WizardSkin = {
  bodyContent: { padding: 20, gap: 10 },
  sidebar: { width: 170, flexShrink: 0, padding: 16, borderEndWidth: 1 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
};
export const iosSkin: WizardSkin = webSkin;
export const androidSkin: WizardSkin = webSkin;
/** The segmented steps under the title on a narrow panel. */
export const headerSteps: ViewStyle = { marginTop: 14 };
/** Without a rail the Dialog pads the body itself, so the content adds none of its own. */
export const dialogPadsBody: ViewStyle = { padding: 0 };

/** `assistant`: the step rail as a desktop window's sidebar, 240 wide, its rows 8 in, one
 * step off the panel's fill behind a hairline (reference claude-desktop-chat). */
/** The assistant rail's width, and the panel width below which it gives way to segmented
 * steps in the top bar so the conversation keeps a usable column. */
/** The reference sidebar: 287 wide plus its hairline. */
export const ASSISTANT_RAIL = 287;
export const ASSISTANT_MINIMUM_PANEL = 720;
export const assistantRail: ViewStyle = { width: ASSISTANT_RAIL, flexShrink: 0, paddingHorizontal: 8, paddingTop: 12, borderEndWidth: 1 };
export const assistantActions: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1, minWidth: 0 };
/** A scrolled body's content in the conversation's column: 768 at most, centered. */
export const assistantColumn: ViewStyle = { width: "100%", maxWidth: 816, alignSelf: "center", paddingHorizontal: 24, paddingVertical: 24, gap: 12 };
export const assistantColumnNarrow: ViewStyle = { ...assistantColumn, paddingHorizontal: 12, paddingVertical: 16 };
