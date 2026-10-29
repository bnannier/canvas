import { MONO_FONT } from "../../style/index.js";
import { type DividerSkin } from "./divider.shared.js";

// Per-OS Divider skins. Divider is a "Shared" treatment: a thin rule reads the same on every
// platform (SwiftUI Divider, the Material 3 1dp divider, and Catalyst's <hr> are all a single
// hairline with no native shape to diverge on). So the skin values are identical across iOS,
// Android, and web. `webSkin` carries the v4 hand-off's look (`K.def('divider')` in
// tools/v4/handoff/cv-kit-controls.js): a 1px rule in the line colour, a gap-12 label row,
// and the label in the hand-off's mono caption, 500 11px uppercase tracked +0.08em (0.88px)
// in the subtle ink (the shell paints the colour); the iOS and Android skins reference it
// directly so there is one look everywhere. The line height is the mono face's normal line
// at 11 px, 14, as Chromium lays JetBrains Mono out on the served hand-off page (the
// renderer sets no line ratio).

export const webSkin: DividerSkin = {
  ruleThickness: 1,
  labelGap: 12,
  labelType: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    letterSpacing: 0.88,
    textTransform: "uppercase",
  },
  // The hand-off docs navbar's separators (Controls.dc.html): 1 x 18 px with 0 4px margins.
  insetLength: 18,
  insetMargin: 4,
};

// Shared treatment: no per-OS divergence, so the native skins are the web skin.
export const iosSkin: DividerSkin = webSkin;
export const androidSkin: DividerSkin = webSkin;
