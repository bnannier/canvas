import { type ViewStyle, type TextStyle } from "react-native";
import { MONO_FONT } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { type KbdSkin } from "./kbd.shared.js";

// Per-OS Kbd skins. Kbd is a "Shared" treatment: neither iOS nor Material 3 ships a
// native keyboard-key cap, so all three platforms render ONE look, the Canvas v4
// hand-off's key cap (`K.def('kbd')` in tools/v4/handoff/cv-kit-controls.js): a 24px
// cap at least 24 wide with 6px sides, the 6px key corner, the raised neutral fill inside
// the field border with a 2px bottom edge (the key's depth), and a 500 12px mono label in
// the foreground ink. Caps sit 4px apart; a sequence says "then" between them in the
// 400 11px interface face, in the subtle ink. The iOS and Android skins reference the
// SAME values as the web skin; the token-driven colors live in kbd.shared.tsx.

// The key-cap box: a centered row, fixed cap height, a minimum width so a single glyph
// still reads as a key, the 6px key corner, the 1px edge with its 2px bottom, and 6px sides.
const CAP_BOX: ViewStyle = {
  flexDirection: "row",
  height: 24,
  minWidth: 24,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: platformShape.web.key,
  borderWidth: 1,
  borderBottomWidth: 2,
  paddingHorizontal: 6,
};

// The key label: the hand-off's 500 12px mono glyph.
const LABEL_TYPE: TextStyle = { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "500" };

// The "then" between the caps of a sequence: 400 11px in the interface face.
const SEPARATOR_TYPE: TextStyle = { fontSize: 11, lineHeight: 14, fontWeight: "400" };

// The chord wrapper: a centered row with the hand-off's 4px between caps.
const CHORD_ROW: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 4 };

// Web: the hand-off's key cap (the search field's "⌘ K" hint, Command's shortcuts).
export const webSkin: KbdSkin = {
  capBox: CAP_BOX,
  labelType: LABEL_TYPE,
  separatorType: SEPARATOR_TYPE,
  chordRow: CHORD_ROW,
};

// Shared treatment: iOS and Android render the identical web look (no native keycap).
export const iosSkin: KbdSkin = webSkin;
export const androidSkin: KbdSkin = webSkin;
