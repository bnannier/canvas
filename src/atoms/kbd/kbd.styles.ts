import { type ViewStyle, type TextStyle } from "react-native";
import { type KbdSkin } from "./kbd.shared.js";

// Per-OS Kbd skins. Kbd is a "Shared" treatment: neither iOS nor Material 3 ships a
// native keyboard-key cap, so all three platforms render ONE look — the web key cap
// from shadcn/ui (a hairline-bordered, muted-fill cap with small medium-weight text).
// The iOS and Android skins therefore reference the SAME values as the web skin; the
// token-driven surface (border + muted fill) and label color live in kbd.shared.tsx.

// The key-cap box: a centered row, fixed cap height, a minimum width so a single glyph
// still reads as a key, the small radius, a hairline border, and snug horizontal padding.
const CAP_BOX: ViewStyle = {
  flexDirection: "row",
  height: 20,
  minWidth: 20,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 4,
  borderWidth: 1,
  paddingHorizontal: 6,
};

// The key label: small, medium-weight text.
const LABEL_TYPE: TextStyle = { fontSize: 12, lineHeight: 16, fontWeight: "500" };

// Web: the current Canvas look, matched to shadcn/ui's kbd.
export const webSkin: KbdSkin = {
  capBox: CAP_BOX,
  labelType: LABEL_TYPE,
};

// Shared treatment: iOS and Android render the identical web look (no native keycap).
export const iosSkin: KbdSkin = webSkin;
export const androidSkin: KbdSkin = webSkin;
