import { type DividerSkin } from "./divider.shared.js";

// Per-OS Divider skins. Divider is a "Shared" treatment: a thin rule reads the same on every
// platform (SwiftUI Divider, the Material 3 1dp divider, and Catalyst's <hr> are all a single
// hairline with no native shape to diverge on). So the skin values are identical across iOS,
// Android, and web. `webSkin` carries the established Canvas look verbatim (a 1px rule, a
// gap-12 label row, and xs/16 label type); the iOS and Android skins reference it directly so
// there is one look everywhere.

export const webSkin: DividerSkin = {
  ruleThickness: 1,
  labelGap: 12,
  labelType: { fontSize: 12, lineHeight: 16 },
};

// Shared treatment: no per-OS divergence, so the native skins are the web skin.
export const iosSkin: DividerSkin = webSkin;
export const androidSkin: DividerSkin = webSkin;
