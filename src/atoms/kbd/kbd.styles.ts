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
// 400 11px interface face, in the subtle ink. `comfortable` is the hand-off's page key
// (its component page's Keyboard card): the same cap padded 3px above and below the
// label and 8px at the sides. The iOS and Android skins reference the SAME values as
// the web skin; the token-driven colors live in kbd.shared.tsx.

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

// The comfortable cap: the key the hand-off's component page draws beside a key's effect
// (tools/v4/handoff/Canvas v4.0.0 Component.dc.html, the Keyboard card's rows:
// `padding:3px 8px;border-radius:6px;background:var(--sf3);border:1px solid var(--ln2);
// border-bottom-width:2px;font:500 12px var(--fm)`). The same corner, edge and label as
// the 24px cap, with 3px above and below the label's 16px line (25px tall with the 1px
// edge and its 2px bottom) and 8px sides, so the cap sits as padding around its glyph
// instead of at a fixed height.
const COMFORTABLE_CAP_BOX: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: platformShape.web.key,
  borderWidth: 1,
  borderBottomWidth: 2,
  paddingVertical: 3,
  paddingHorizontal: 8,
};

// The compact caps of the hand-off's section pages, each a fixed-height key with its label
// on a line 2 px under the cap (so the 1 px edge holds it):
//   `small`, the 22 px cap (Canvas v4.0.0 Inputs.dc.html, the search field's "⌘K", and
//     Overlays.dc.html, the command palette's "esc": `height:22px;padding:0 6px;
//     border-radius:5px;...;font:500 11px/20px var(--fm)`);
//   `tiny`, the 20 px cap (Navigation.dc.html, the navbar search's "⌘K": `height:20px;
//     padding:0 5px;border-radius:4px;...;font:500 10px/18px var(--fm)`).
const SMALL_CAP_BOX: ViewStyle = { ...CAP_BOX, height: 22, minWidth: 22, borderRadius: platformShape.web.keySmall };
const TINY_CAP_BOX: ViewStyle = { ...CAP_BOX, height: 20, minWidth: 20, borderRadius: platformShape.web.keyTiny, paddingHorizontal: 5 };
const SMALL_LABEL_TYPE: TextStyle = { fontFamily: MONO_FONT, fontSize: 11, lineHeight: 20, fontWeight: "500" };
const TINY_LABEL_TYPE: TextStyle = { fontFamily: MONO_FONT, fontSize: 10, lineHeight: 18, fontWeight: "500" };

// The key label: the hand-off's 500 12px mono glyph.
const LABEL_TYPE: TextStyle = { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "500" };

// The "then" between the caps of a sequence: 400 11px in the interface face.
const SEPARATOR_TYPE: TextStyle = { fontSize: 11, lineHeight: 14, fontWeight: "400" };

// The chord wrapper: a centered row with the hand-off's 4px between caps.
const CHORD_ROW: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 4 };

// Web: the hand-off's key cap (the search field's "⌘ K" hint, Command's shortcuts).
export const webSkin: KbdSkin = {
  capBox: CAP_BOX,
  comfortableCapBox: COMFORTABLE_CAP_BOX,
  sizes: { small: { capBox: SMALL_CAP_BOX, labelType: SMALL_LABEL_TYPE }, tiny: { capBox: TINY_CAP_BOX, labelType: TINY_LABEL_TYPE } },
  labelType: LABEL_TYPE,
  separatorType: SEPARATOR_TYPE,
  chordRow: CHORD_ROW,
};

// Shared treatment: iOS and Android render the identical web look (no native keycap).
export const iosSkin: KbdSkin = webSkin;
export const androidSkin: KbdSkin = webSkin;
